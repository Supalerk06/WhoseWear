<script setup>
import { ref, computed, watch ,nextTick } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  pattern_type: 'solid',
  colors: [''],
  category: '',
  owner: '',
});

const imageFile = ref(null);
const imagePreview = ref(null);
const initialFormString = ref('');

// Predefined colors for solid selection
const solidColors = [
  'ขาว', 'ดำ', 'เทา', 'แดง', 'ชมพู', 'เขียว', 'ฟ้า', 'น้ำเงิน', 'เหลือง', 'ส้ม', 'ม่วง', 'น้ำตาล', 'ครีม'
];

// Predefined categories as requested
const categories = [
  "ชุดทำงาน",
  "ชุดนอน",
  "เสื้อโปโล",
  "เสื้อเชิ้ต",
  "เสื้อยืด",
  "เสื้อกันหนาว",
  "กางเกงขาสั้น",
  "กางเกงขายาว",
  "กระโปรง",
  "หมวก",
  "ถุงเท้า",
];

// Predefined family members strictly as requested
const owners = ['ภูมิ', 'แพร', 'จิ๋ว', 'เก๋', 'ใหญ่'];


// โครงสร้างที่ 1: จัดการเปิด/ปิดโมดอล และเคลียร์ค่าเริ่มต้นให้พร้อมเสร็จสรรพในรอบเดียว
watch(() => props.show, async (newShow) => {
  if (newShow) {
    if (props.item) {
      // ---- โหมดแก้ไขข้อมูล (EDIT MODE) ----
      // 1. ดักจับและกำหนดค่าเริ่มต้นที่ปลอดภัย (Fallback) เพื่อป้องกันกรณีข้อมูลจาก DB เป็น Null/Undefined
      const safePatternType = props.item.pattern_type || 'solid';
      let safeColors = Array.isArray(props.item.colors) ? [...props.item.colors] : [];

      // 2. จัดการรูปทรงของอาเรย์สีให้ถูกต้องตามโครงสร้าง UI "ตั้งแต่เกิด" เพื่อไม่ให้ Watcher ตัวที่สองมาแก้ทีหลัง
      if (safePatternType === 'pattern') {
        if (safeColors.length <= 1) {
          safeColors = [safeColors[0] || '', ''];
        }
      } else {
        safeColors = [safeColors[0] || ''];
      }

      // 3. กำหนดค่าให้ Form แบบกลุ่มก้อนเดียว (Atomic Assignment)
      form.value = {
        name: props.item.name || '',
        pattern_type: safePatternType,
        colors: safeColors,
        category: props.item.category || '',
        owner: props.item.owner || ''
      };
      imageFile.value = null;
      imagePreview.value = props.item.image_url || null;

    } else {
      // ---- โหมดเพิ่มข้อมูลใหม่ (ADD MODE) ----
      form.value = {
        name: '',
        pattern_type: 'solid',
        colors: [''],
        category: '',
        owner: ''
      };
      imageFile.value = null;
      imagePreview.value = null;
    }

    // 🌟 จุดสำคัญที่สุด: ใช้ nextTick เพื่อรอให้ระบบ Reactivity และ Watcher ตัวอื่นประมวลผลจนนิ่งสนิทก่อน
    // จากนั้นค่อยสั่งบันทึกสถานะตั้งต้น จะช่วยแก้บัค "แจ้งเตือนฟอร์มเปลี่ยนทั้งที่ยังไม่ได้กดอะไร" ได้ขาดลอยครับ
    await nextTick();
    initialFormString.value = JSON.stringify(form.value);
  }
},{ immediate: true });


// โครงสร้างที่ 2: เฝ้าดูการเปลี่ยนประเภท (สีพื้น / ลาย) เฉพาะตอนที่ผู้ใช้กำลังกรอกข้อมูลบนหน้าจอจริงเท่านั้น
watch(() => form.value?.pattern_type, (newType) => {
  // ดักจับกรณีถ้าปิดโมดอลอยู่ หรือฟอร์มยังไม่ถูกสร้าง ไม่ต้องรันโค้ดส่วนนี้ต่อ
  if (!props.show || !form.value) return;

  if (newType === 'pattern') {
    // โหมดผ้าลาย: ตรวจสอบถ้ามีช่องใส่สีไม่ถึง 2 ช่อง ให้ขยายช่องรองรับทันที
    if (form.value.colors.length <= 1) {
      form.value.colors = [form.value.colors[0] || '', ''];
    }
  } else {
    // โหมดสีพื้น: หดอาเรย์ให้เหลือสีเดียว เพื่อความถูกต้องของโครงสร้างข้อมูล
    if (form.value.colors.length !== 1) {
      form.value.colors = [form.value.colors[0] || ''];
    }
  }
});

// Image handlers
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  document.getElementById('image-input').click();
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  const input = document.getElementById('image-input');
  if (input) input.value = '';
};

// Dynamic color list controls for Pattern type
const addColorInput = () => {
  form.value.colors.push('');
};

const removeColorInput = (index) => {
  if (form.value.colors.length > 1) {
    form.value.colors.splice(index, 1);
  }
};

// Detect if any form value changed (For Edit Mode disable-save requirement)
// Detect if any form value changed (For Edit Mode disable-save requirement)
const isFormChanged = computed(() => {
  if (!props.item) {
    return true; // Always allow save in Add mode
  }
  
  // 🌟 [แก้บัคที่นี่]: ดักจับกรณีที่หน้าต่างเพิ่งเปิดและยังเซฟสถานะเริ่มต้นไม่เสร็จ ป้องกันโค้ดพัง!
  if (!initialFormString.value) {
    return false;
  }
  
  if (imageFile.value !== null) return true; // Changed if a new image was selected
  if (imagePreview.value === null && props.item.image_url !== null) return true; // Image removed

  try {
    const current = JSON.stringify({
      name: form.value.name.trim(),
      pattern_type: form.value.pattern_type,
      colors: form.value.colors.map(c => c.trim()).filter(c => c !== ''),
      category: form.value.category,
      owner: form.value.owner
    });

    const parsedInitial = JSON.parse(initialFormString.value);
    const normalizedInitial = JSON.stringify({
      name: parsedInitial.name.trim(),
      pattern_type: parsedInitial.pattern_type,
      colors: parsedInitial.colors.map(c => c.trim()).filter(c => c !== ''),
      category: parsedInitial.category,
      owner: parsedInitial.owner
    });

    return current !== normalizedInitial;
  } catch (e) {
    return false; // ถ้าเกิดข้อผิดพลาดในการคำนวณ ให้ปิดปุ่มเซฟไว้ก่อนเพื่อความปลอดภัย
  }
});

// Compute form validity
const isFormValid = computed(() => {
  if (props.saving) return false;
  if (!form.value.name.trim()) return false;
  if (!form.value.category) return false;
  if (!form.value.owner) return false;
  if (!imagePreview.value) return false;

  // Colors check
  const activeColors = form.value.colors.map(c => c.trim()).filter(c => c !== '');
  if (activeColors.length === 0) return false;

  // Edit-mode specific difference check
  if (props.item && !isFormChanged.value) return false;

  return true;
});

const submitForm = () => {
  if (!isFormValid.value) return;
  emit('save', {
    form: {
      ...form.value,
      colors: form.value.colors.map(c => c.trim()).filter(c => c !== '')
    },
    imageFile: imageFile.value
  });
};
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="item ? 'แก้ไขข้อมูลเสื้อผ้า' : 'เพิ่มเสื้อผ้าของคุณ'" 
    @close="emit('close')"
  >
    <form @submit.prevent="submitForm" class="space-y-6 py-2">
      
      <!-- 1. Image Upload Section -->
      <div class="space-y-2">
        <label class="block text-xl  text-slate-800 dark:text-slate-200">
          รูปภาพเสื้อผ้า <span class="text-red-500">*</span>
        </label>
        
        <input 
          id="image-input" 
          type="file" 
          accept="image/*" 
          class="hidden" 
          @change="onFileChange"
        />

        <!-- Image Preview / Drop area -->
        <div 
          v-if="imagePreview" 
          class="relative w-full aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 group"
        >
          <img 
            :src="imagePreview" 
            alt="Preview" 
            class="w-full h-full object-contain"
          />
          <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-4">
            <button 
              type="button" class="px-5 py-2.5 rounded-xl text-lg  transition-all border-2 cursor-pointer bg-white text-slate-800 hover:bg-slate-100 flex items-center min-h-[48px]"
              @click="triggerFileInput"
            >
              เปลี่ยนรูปภาพ
            </button>
            <button 
              type="button" 
              class="py-3 px-6 text-lg  text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors duration-150 flex items-center min-h-[48px]"
              @click="removeImage"
            >
              ลบรูปภาพ
            </button>
          </div>
        </div>
        
        <button 
          v-else 
          type="button"
          class="w-full aspect-video md:aspect-[2/1] rounded-2xl border-4 border-dashed border-slate-300 hover:border-indigo-500 dark:border-slate-700 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-3 transition-colors duration-150 group"
          @click="triggerFileInput"
        >
          <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-xl font-bold text-slate-700 dark:text-slate-300">กดที่นี่เพื่อเพิ่มรูปถ่ายเสื้อผ้า</span>
          <span class="text-sm text-slate-400 dark:text-slate-500">รองรับรูปถ่ายทุกประเภท</span>
        </button>
      </div>

      <!-- 2. Clothing Name -->
      <div class="space-y-2">
        <label for="name" class="block text-xl  text-slate-800 dark:text-slate-200">
          ข้อความบนเสื้อผ้า <span class="text-red-500">*</span>
        </label>
        <input 
          id="name" 
          v-model="form.name" 
          type="text" 
          placeholder="ระบุข้อความที่อยู่บนเสื้อผ้า เช่น Nirvana 2006" 
          class="w-full text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
          required
        />
      </div>

      <!-- 3. Category & Owner Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Category -->
        <div class="space-y-2">
          <label for="category" class="block text-xl  text-slate-800 dark:text-slate-200">
            ประเภทของเสื้อผ้า <span class="text-red-500">*</span>
          </label>
          <select 
            id="category" 
            v-model="form.category"
            class="w-full text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100  min-h-[60px]"
          >
            <option value="" selected disabled>-- เลือกประเภท --</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Owner -->
        <div class="space-y-2">
          <label for="owner" class="block text-xl  text-slate-800 dark:text-slate-200">
            เจ้าของเสื้อผ้า <span class="text-red-500">*</span>
          </label>
          <select 
            id="owner" 
            v-model="form.owner"
            class="w-full text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100 min-h-[60px]"
          >
            <option value="" selected disabled>-- ชื่อของคุณ --</option>
            <option v-for="own in owners" :key="own" :value="own">{{ own }}</option>
          </select>
        </div>
      </div>

      <!-- 4. Pattern / Solid Selection -->
      <div class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="space-y-2">
          <label for="pattern-type" class="block text-xl  text-slate-800 dark:text-slate-200">
            ลักษณะสีของเสื้อผ้า <span class="text-red-500">*</span>
          </label>
          <select 
            id="pattern-type" 
            v-model="form.pattern_type"
            class="w-full text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100 min-h-[60px]"
          >
            <option value="solid">สีเดี่ยวๆ (สีพื้น)</option>
            <option value="pattern">เป็นลาย (มีหลายสี)</option>
          </select>
        </div>

        <!-- Dynamic Inputs -->
        <div v-if="form.pattern_type === 'solid'" class="space-y-2">
  <label for="solid-color" class="block text-lg text-slate-600 dark:text-slate-400">
    เลือกโทนสีของเสื้อผ้า <span class="text-red-500">*</span>
  </label>
  <select 
    id="solid-color" 
    v-model="form.colors[0]"
    class="w-full text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100 min-h-[60px]"
  >
    <option value="" disabled>-- เลือกสี --</option>
    <option v-for="color in solidColors" :key="color" :value="color">{{ color }}</option>
  </select>
</div>

<div v-else class="space-y-3">
  <label class="block text-lg text-slate-600 dark:text-slate-400">
    โทนสีที่มีอยู่บนลายเสื้อ (เลือกได้หลายสี) <span class="text-red-500">*</span>
  </label>
  
  <div class="space-y-2">
    <div 
      v-for="(color, index) in form.colors" 
      :key="index" 
      class="flex items-center gap-3"
    >
      <span class="text-lg text-slate-400 w-8 text-center">{{ index + 1 }}.</span>
      
      <select 
        v-model="form.colors[index]"
        class="flex-grow text-xl p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-colors duration-150 text-slate-800 dark:text-slate-100 min-h-[60px]"
        required
      >
        <option value="" disabled>-- เลือกสี --</option>
        <option v-for="colorOption in solidColors" :key="colorOption" :value="colorOption">
          {{ colorOption }}
        </option>
      </select>

      <button 
        v-if="form.colors.length > 1"
        type="button"
        class="p-4 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-colors duration-150 min-w-[56px] min-h-[56px] flex items-center justify-center border border-transparent hover:border-red-200 dark:hover:border-red-900 cursor-pointer"
        @click="removeColorInput(index)"
        aria-label="ลบช่องเลือกสีนี้"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>

  <button 
    type="button"
    class="mt-2 w-full py-4 px-6 text-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-2xl transition-all duration-150 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
    @click="addColorInput"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    เพิ่มสีที่พบบนลายเสื้อ
  </button>
</div>
      </div>

      <!-- Action Footer Buttons -->
      <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
        <button 
          type="button"
          class="flex-1 py-4 px-6 text-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 transition-colors duration-150 min-h-[56px] flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
          :disabled="saving"
          @click="emit('close')"
        >
          ยกเลิก
        </button>
        <button 
          type="submit"
          class="flex-1 py-4 px-6 text-xl font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-250 dark:shadow-none disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-150 min-h-[56px] flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
          :disabled="!isFormValid"
        >
          <template v-if="saving">
            <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังบันทึก...</span>
          </template>
          <template v-else>
            <span>บันทึกข้อมูล</span>
          </template>
        </button>
      </div>

    </form>
  </BaseModal>
</template>
