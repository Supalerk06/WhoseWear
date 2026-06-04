import { ref, onUnmounted } from 'vue';
import { supabase } from '../supabaseClient';

// Check if Supabase configuration is provided
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSupabase() {
  const clothes = ref([]);
  const loading = ref(true);
  const error = ref(null);
  let realtimeChannel = null;

  const fetchClothes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('clothes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      clothes.value = data || [];
    } catch (err) {
      console.error("Supabase loading error:", err);
      error.value = "เกิดข้อผิดพลาดในการโหลดข้อมูลเสื้อผ้าจากระบบ";
    } finally {
      loading.value = false;
    }
  };

  const subscribeToClothes = () => {
    if (!isSupabaseConfigured) {
      error.value = "กรุณาตั้งค่าเชื่อมต่อ Supabase ในไฟล์ .env ก่อนใช้งาน";
      loading.value = false;
      return;
    }

    // Initial fetch
    fetchClothes();

    // Subscribe to realtime changes
    realtimeChannel = supabase.channel('public:clothes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clothes' },
        (payload) => {
          // When a change occurs in the DB, re-fetch to keep it simple and synchronized
          fetchClothes();
        }
      )
      .subscribe();
  };

  onUnmounted(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  });

  const addClothingItem = async (item, imageFile) => {
    try {
      let image_url = '';
      let image_path = '';

      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
        image_path = fileName; // using just filename for root path in bucket

        const { error: uploadError } = await supabase.storage
          .from('clothing-images')
          .upload(image_path, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('clothing-images')
          .getPublicUrl(image_path);
          
        image_url = publicUrlData.publicUrl;
      }

      // Save to Postgres
      const { error: insertError } = await supabase
        .from('clothes')
        .insert([{
          name: item.name.trim(),
          pattern_type: item.pattern_type,
          colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
          category: item.category,
          owner: item.owner,
          image_url: image_url,
          image_path: image_path
        }]);

      if (insertError) throw insertError;

    } catch (err) {
      console.error("Error adding clothing to Supabase:", err);
      throw new Error("ไม่สามารถบันทึกข้อมูลเสื้อผ้าได้: " + err.message);
    }
  };

  const updateClothingItem = async (id, item, newImageFile, oldImagePath) => {
    try {
      let image_url = item.image_url;
      let image_path = item.image_path;

      if (newImageFile) {
        // Upload new image
        const fileExtension = newImageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
        image_path = fileName;
        
        const { error: uploadError } = await supabase.storage
          .from('clothing-images')
          .upload(image_path, newImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('clothing-images')
          .getPublicUrl(image_path);
          
        image_url = publicUrlData.publicUrl;

        // Delete old image from Storage
        if (oldImagePath) {
          const { error: deleteStorageError } = await supabase.storage
            .from('clothing-images')
            .remove([oldImagePath]);
          if (deleteStorageError) {
            console.warn("Could not delete old image from Supabase Storage:", deleteStorageError);
          }
        }
      }

      const { error: updateError } = await supabase
        .from('clothes')
        .update({
          name: item.name.trim(),
          pattern_type: item.pattern_type,
          colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
          category: item.category,
          owner: item.owner,
          image_url: image_url,
          image_path: image_path
        })
        .eq('id', id);

      if (updateError) throw updateError;

    } catch (err) {
      console.error("Error updating clothing in Supabase:", err);
      throw new Error("ไม่สามารถแก้ไขข้อมูลได้: " + err.message);
    }
  };

  const deleteClothingItem = async (id, imagePath) => {
    try {
      // Delete Postgres document
      const { error: deleteError } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete Storage image
      if (imagePath) {
        const { error: deleteStorageError } = await supabase.storage
          .from('clothing-images')
          .remove([imagePath]);
          
        if (deleteStorageError) {
          console.warn("Could not delete image from Supabase Storage:", deleteStorageError);
        }
      }
    } catch (err) {
      console.error("Error deleting from Supabase:", err);
      throw new Error("ไม่สามารถลบเสื้อผ้าได้: " + err.message);
    }
  };

  return {
    clothes,
    loading,
    error,
    subscribeToClothes,
    addClothingItem,
    updateClothingItem,
    deleteClothingItem,
    isSupabaseConfigured: !!isSupabaseConfigured
  };
}
