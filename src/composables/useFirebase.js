import { ref, onUnmounted } from 'vue';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase configuration is provided
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== '' && !firebaseConfig.apiKey.includes('YOUR_API_KEY');

let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("WhoseWear: Firebase initialized successfully.");
  } catch (error) {
    console.error("WhoseWear: Firebase initialization failed, falling back to Demo Mode.", error);
  }
} else {
  console.warn("WhoseWear: Firebase configuration is missing or incomplete. Running in Demo (LocalStorage) Mode.");
}

// ==========================================
// LOCAL STORAGE DEMO SEED DATA & MOCK SYSTEM
// ==========================================
const mockListeners = new Set();
const triggerMockListeners = () => {
  const data = getMockClothes();
  mockListeners.forEach(cb => cb(data));
};

const getMockClothes = () => {
  const data = localStorage.getItem('ww_clothes');
  if (!data) {
    // Seed items in Thai
    const seed = [
      {
        id: 'mock-1',
        name: 'เสื้อยืดแขนสั้นลายส้มดำ',
        isPattern: true,
        colors: ['ส้ม', 'ดำ'],
        category: 'เสื้อ',
        owner: 'ภูมิ',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
        imagePath: 'mock/1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        name: 'กางเกงขาสั้นสีเทาเข้ม',
        isPattern: false,
        colors: ['เทา'],
        category: 'กางเกง',
        owner: 'แพร',
        imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=400',
        imagePath: 'mock/2',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'mock-3',
        name: 'หมวกแก๊ปสีดำเดี่ยว',
        isPattern: false,
        colors: ['ดำ'],
        category: 'หมวก',
        owner: 'ใหญ่',
        imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400',
        imagePath: 'mock/3',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'mock-4',
        name: 'ถุงเท้าข้อยาวลายนกยูงสีขาวเขียว',
        isPattern: true,
        colors: ['ขาว', 'เขียว'],
        category: 'ถุงเท้า',
        owner: 'จิ๋ว',
        imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=400',
        imagePath: 'mock/4',
        createdAt: new Date(Date.now() - 10800000).toISOString()
      }
    ];
    localStorage.setItem('ww_clothes', JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
// ==========================================

export function useFirebase() {
  const clothes = ref([]);
  const loading = ref(true);
  const error = ref(null);
  let unsubscribe = null;

  const subscribeToClothes = () => {
    loading.value = true;
    error.value = null;

    if (db) {
      const q = query(collection(db, 'clothes'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
          });
        });
        clothes.value = list;
        loading.value = false;
      }, (err) => {
        console.error("Firestore loading error:", err);
        error.value = "เกิดข้อผิดพลาดในการโหลดข้อมูลเสื้อผ้า";
        loading.value = false;
      });
    } else {
      // LocalStorage Mock mode
      const updateData = (data) => {
        clothes.value = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        loading.value = false;
      };

      updateData(getMockClothes());

      const listener = (data) => {
        updateData(data);
      };

      mockListeners.add(listener);
      
      unsubscribe = () => {
        mockListeners.delete(listener);
      };
    }
  };

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const addClothingItem = async (item, imageFile) => {
    if (db && storage) {
      try {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
        const path = `clothes/${fileName}`;
        const imageRef = storageRef(storage, path);
        
        // Upload image to Storage
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        // Save doc to Firestore
        await addDoc(collection(db, 'clothes'), {
          name: item.name.trim(),
          isPattern: item.isPattern,
          colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
          category: item.category,
          owner: item.owner,
          imageUrl: imageUrl,
          imagePath: path,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error adding clothing to Firebase:", err);
        throw new Error("ไม่สามารถบันทึกข้อมูลเสื้อผ้าได้: " + err.message);
      }
    } else {
      // LocalStorage Mock
      try {
        let imageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
        if (imageFile) {
          imageUrl = await fileToBase64(imageFile);
        }

        const mockList = getMockClothes();
        const newItem = {
          id: `mock-${Date.now()}`,
          name: item.name.trim(),
          isPattern: item.isPattern,
          colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
          category: item.category,
          owner: item.owner,
          imageUrl: imageUrl,
          imagePath: `mock/${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        mockList.push(newItem);
        localStorage.setItem('ww_clothes', JSON.stringify(mockList));
        triggerMockListeners();
      } catch (err) {
        console.error("Error adding clothing to Mock storage:", err);
        throw new Error("ไม่สามารถบันทึกข้อมูลได้ (โหมดสาธิต)");
      }
    }
  };

  const updateClothingItem = async (id, item, newImageFile, oldImagePath) => {
    if (db && storage) {
      try {
        let imageUrl = item.imageUrl;
        let imagePath = item.imagePath;

        if (newImageFile) {
          // Delete old image from Storage if it exists and isn't mock
          if (oldImagePath && !oldImagePath.startsWith('mock/')) {
            try {
              await deleteObject(storageRef(storage, oldImagePath));
            } catch (err) {
              console.warn("Could not delete old image from Firebase Storage:", err);
            }
          }

          // Upload new image
          const fileExtension = newImageFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
          imagePath = `clothes/${fileName}`;
          const imageRef = storageRef(storage, imagePath);
          
          await uploadBytes(imageRef, newImageFile);
          imageUrl = await getDownloadURL(imageRef);
        }

        const docRef = doc(db, 'clothes', id);
        await updateDoc(docRef, {
          name: item.name.trim(),
          isPattern: item.isPattern,
          colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
          category: item.category,
          owner: item.owner,
          imageUrl: imageUrl,
          imagePath: imagePath
        });
      } catch (err) {
        console.error("Error updating clothing in Firebase:", err);
        throw new Error("ไม่สามารถแก้ไขข้อมูลได้: " + err.message);
      }
    } else {
      // LocalStorage Mock
      try {
        let imageUrl = item.imageUrl;
        let imagePath = item.imagePath;

        if (newImageFile) {
          imageUrl = await fileToBase64(newImageFile);
          imagePath = `mock/${Date.now()}`;
        }

        const mockList = getMockClothes();
        const index = mockList.findIndex(x => x.id === id);
        if (index !== -1) {
          mockList[index] = {
            ...mockList[index],
            name: item.name.trim(),
            isPattern: item.isPattern,
            colors: item.colors.map(c => c.trim()).filter(c => c !== ''),
            category: item.category,
            owner: item.owner,
            imageUrl: imageUrl,
            imagePath: imagePath
          };
          localStorage.setItem('ww_clothes', JSON.stringify(mockList));
          triggerMockListeners();
        }
      } catch (err) {
        console.error("Error updating clothing in Mock storage:", err);
        throw new Error("ไม่สามารถแก้ไขข้อมูลได้ (โหมดสาธิต)");
      }
    }
  };

  const deleteClothingItem = async (id, imagePath) => {
    if (db && storage) {
      try {
        // Delete Firestore document
        await deleteDoc(doc(db, 'clothes', id));

        // Delete Storage image if not mock
        if (imagePath && !imagePath.startsWith('mock/')) {
          try {
            await deleteObject(storageRef(storage, imagePath));
          } catch (err) {
            console.warn("Could not delete image from Firebase Storage:", err);
          }
        }
      } catch (err) {
        console.error("Error deleting from Firebase:", err);
        throw new Error("ไม่สามารถลบเสื้อผ้าได้: " + err.message);
      }
    } else {
      // LocalStorage Mock
      try {
        const mockList = getMockClothes();
        const filtered = mockList.filter(x => x.id !== id);
        localStorage.setItem('ww_clothes', JSON.stringify(filtered));
        triggerMockListeners();
      } catch (err) {
        console.error("Error deleting from Mock storage:", err);
        throw new Error("ไม่สามารถลบข้อมูลได้ (โหมดสาธิต)");
      }
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
    isFirebaseMode: !!db
  };
}
