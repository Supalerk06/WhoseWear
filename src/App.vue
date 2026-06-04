<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSupabase } from "./composables/useSupabase";
import ClothingCard from "./components/ClothingCard.vue";
import FormModal from "./components/FormModal.vue";
import DetailModal from "./components/DetailModal.vue";
import ConfirmModal from "./components/ConfirmModal.vue";

// Composables
const {
  clothes,
  loading,
  error,
  isSupabaseConfigured,
  subscribeToClothes,
  addClothingItem,
  updateClothingItem,
  deleteClothingItem,
} = useSupabase();



const ownerColors = {
  'ภูมิ': 'bg-amber-600 border-amber-700 text-white',
  'แพร': 'bg-pink-600 border-pink-700 text-white',
  'จิ๋ว': 'bg-emerald-600 border-emerald-700 text-white',
  'เก๋': 'bg-blue-500 border-blue-600 text-white',
  'ใหญ่': 'bg-teal-600 border-teal-700 text-white',
}

// State

const searchQuery = ref("");
const activeCategoryFilter = ref("ทั้งหมด");
const activeOwnerFilter = ref("ทั้งหมด");
const activePatternFilter = ref("ทั้งหมด");
const selectedColors = ref([]); // unified color selection array
const solidColors = [
  { name: "ขาว", code: "#FFFFFF" },
  { name: "ดำ", code: "#1A1A1A" },
  { name: "เทา", code: "#808080" },
  { name: "แดง", code: "#E53935" },
  { name: "ชมพู", code: "#EC407A" },
  { name: "เขียว", code: "#43A047" },
  { name: "ฟ้า", code: "#4FC3F7" },
  { name: "น้ำเงิน", code: "#0f377f" },
  { name: "เหลือง", code: "#FDD835" },
  { name: "ส้ม", code: "#FB8C00" },
  { name: "ม่วง", code: "#8E24AA" },
  { name: "น้ำตาล", code: "#6D4C41" },
  { name: "ครีม", code: "#DDB4A5" },
];
const isDarkMode = ref(false);

const selectColor = (color) => {
  const colorName = typeof color === "object" ? color.name : color;
  if (activePatternFilter.value === "สีพื้น") {
    // Solid mode: only one color selected
    selectedColors.value = [colorName];
  } else if (activePatternFilter.value === "ลาย") {
    // Pattern mode: toggle multiple selection
    if (selectedColors.value.includes(colorName)) {
      selectedColors.value = selectedColors.value.filter(
        (c) => c !== colorName
      );
    } else {
      selectedColors.value.push(colorName);
    }
  }
};

// Reset color filters when pattern type changes
watch(activePatternFilter, (newVal) => {
  // Reset selected colors when switching filter type
  selectedColors.value = [];
});

// Reset all filters to default values
const resetFilters = () => {
  activeOwnerFilter.value = "ทั้งหมด";
  activeCategoryFilter.value = "ทั้งหมด";
  activePatternFilter.value = "ทั้งหมด";
  selectedColors.value = [];
  searchQuery.value = "";
};
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isConfirmDeleteOpen = ref(false);
const actionLoading = ref(false);

const selectedItem = ref(null);
const itemToEdit = ref(null);
const itemToDelete = ref(null);

// Constants
const colorOptions = [
  { name: "ขาว", code: "#FFFFFF" },
  { name: "ดำ", code: "#000000" },
  { name: "เทา", code: "#808080" },
  { name: "แดง", code: "#FF0000" },
  { name: "ชมพู", code: "#FFC0CB" },
  { name: "เขียว", code: "#008000" },
  { name: "ฟ้า", code: "#00BFFF" },
  { name: "น้ำเงิน", code: "##0f377f" },
  { name: "เหลือง", code: "#FFFF00" },
  { name: "ส้ม", code: "#FFA500" },
  { name: "ม่วง", code: "#800080" },
  { name: "น้ำตาล", code: "#A52A2A" },
  { name: "ครีม", code: "#DDB4A5" },
];

// Use color objects with name and code
const categories = [
  "ทั้งหมด",
  "เสื้อเชิ้ต",
  "เสื้อยืด",
  "เสื้อกันหนาว",
  "กางเกงขาสั้น",
  "กางเกงขายาว",
  "กระโปรง",
  "หมวก",
  "ถุงเท้า",
];
const owners = ["ทั้งหมด", "ภูมิ", "แพร", "จิ๋ว", "เก๋", "ใหญ่"];
// Initialization
onMounted(() => {
  subscribeToClothes();

  // Initialize dark mode based on system preference or saved preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    isDarkMode.value = true;
    document.documentElement.classList.add("dark");
  }
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Computed
const filteredClothes = computed(() => {
  let result = clothes.value;

  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.colors.some((color) => color.toLowerCase().includes(q))
    );
  }

  // Category Filter
  if (activeCategoryFilter.value !== "ทั้งหมด") {
    result = result.filter(
      (item) => item.category === activeCategoryFilter.value
    );
  }

  // Owner Filter
  if (activeOwnerFilter.value !== "ทั้งหมด") {
    result = result.filter((item) => item.owner === activeOwnerFilter.value);
  }

  // Pattern Filter
  if (activePatternFilter.value === "สีพื้น") {
    result = result.filter((item) => item.pattern_type === "solid");
  } else if (activePatternFilter.value === "ลาย") {
    result = result.filter((item) => item.pattern_type === "pattern");
  }

  // Color Filter
  if (activePatternFilter.value === "สีพื้น" && selectedColors.value.length) {
    // Solid mode: match the single selected color
    const color = selectedColors.value[0];
    result = result.filter((item) => item.colors.includes(color));
  } else if (
    activePatternFilter.value === "ลาย" &&
    selectedColors.value.length
  ) {
    // Pattern mode: match any of the selected colors
    result = result.filter((item) =>
      selectedColors.value.some((col) => item.colors.includes(col))
    );
  }

  return result;
});

// Actions
const openAddModal = () => {
  itemToEdit.value = null;
  isFormModalOpen.value = true;
};

const openEditModal = (item) => {
  itemToEdit.value = item;
  isFormModalOpen.value = true;
};

const openDetailModal = (item) => {
  selectedItem.value = item;
  isDetailModalOpen.value = true;
};

const triggerDelete = (item) => {
  itemToDelete.value = item;
  isConfirmDeleteOpen.value = true;
};

// Submissions
const handleFormSave = async (payload) => {
  actionLoading.value = true;
  try {
    if (itemToEdit.value) {
      // Edit mode
      await updateClothingItem(
        itemToEdit.value.id,
        payload.form,
        payload.imageFile,
        itemToEdit.value.image_path
      );
    } else {
      // Add mode
      await addClothingItem(payload.form, payload.imageFile);
    }
    isFormModalOpen.value = false;
  } catch (err) {
    alert(err.message);
  } finally {
    actionLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!itemToDelete.value) return;
  actionLoading.value = true;
  try {
    await deleteClothingItem(
      itemToDelete.value.id,
      itemToDelete.value.image_path
    );
    isConfirmDeleteOpen.value = false;
    itemToDelete.value = null;

    // Close detail modal if the deleted item was currently open
    if (
      selectedItem.value &&
      selectedItem.value.id === itemToDelete?.value?.id
    ) {
      isDetailModalOpen.value = false;
    }
  } catch (err) {
    alert(err.message);
  } finally {
    actionLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300"
  >
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 py-1 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-4">
            <!-- App Logo/Icon -->
            <div
              class="bg-indigo-600 max-w-[75px] text-white p-1 rounded-full shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <img src="/public/favicon.png" class="w-full" alt="" />
            </div>
            <div>
              <h1
                class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                เสื้อนี้ของใคร?
              </h1>
              <p class="text-sm font-bold text-slate-500 dark:text-slate-400">
                WhoseWear App
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-3 bg-slate-200 cursor-pointer dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="สลับโหมดมืดสว่าง"
            >
              <svg
                v-if="!isDarkMode"
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Error State -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 mt-6">
      <div
        class="bg-red-50 dark:bg-red-900/30 border-l-8 border-red-500 p-6 rounded-2xl flex items-start gap-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-red-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3 class="text-xl font-bold text-red-800 dark:text-red-300">
            เกิดข้อผิดพลาด
          </h3>
          <p class="text-lg text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Demo Mode Warning -->
    <div
      v-if="!isSupabaseConfigured && !error && !loading"
      class="max-w-7xl mx-auto px-4 mt-6"
    >
      <div
        class="bg-amber-50 dark:bg-amber-900/30 border-l-8 border-amber-500 p-6 rounded-2xl flex items-start gap-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-amber-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="text-xl font-bold text-amber-800 dark:text-amber-300">
            Demo Mode
          </h3>
          <p class="text-lg text-amber-700 dark:text-amber-400 mt-1">
            ยังไม่ได้ตั้งค่า Supabase โปรเจกต์จะไม่สามารถบันทึกข้อมูลได้
            กรุณาตั้งค่า .env ก่อน
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Top Actions (Search & Add) -->
      <div
        class="flex flex-col md:flex-row gap-4  items-stretch md:items-center justify-between"
      >
        <!-- Search Input -->
        <div class="relative  w-full md:w-96 group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ค้นหาข้อความบนเสื้อผ้า"
            class=" w-full pl-12 pr-4 py-4 text-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm font-medium"
          />
        </div>

        <!-- Add Button -->
        <button
          @click="openAddModal"
          class="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
          :disabled="!isSupabaseConfigured"
          :title="
            !isSupabaseConfigured
              ? 'กรุณาเชื่อมต่อ Supabase ก่อนใช้งาน'
              : 'เพิ่มเสื้อผ้าใหม่'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          เพิ่มเสื้อผ้าใหม่
        </button>
      </div>

      <!-- Filters Section -->
      <div
        class="bg-slate-100 dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6"
      >
      <div class="flex items-center justify-between py-1">

        <h2
          class="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          ตัวกรองข้อมูล
        </h2>
            <button
              @click="resetFilters"
              class="px-4 py-2 flex items-center justify-center gap-2 text-lg font-bold bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <svg class="dark:fill-[#e3e3e3] " xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M339.5-108.5q-65.5-28.5-114-77t-77-114Q120-365 120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80q-75 0-140.5-28.5Z"/></svg>
              รีเซ็ต
            </button>
      </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Owner Filter -->
          <div class="space-y-3">
            <label
              class="block text-xl font-bold text-slate-600 dark:text-slate-400"
              >เจ้าของ</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="owner in owners"
                :key="owner"
                @click="activeOwnerFilter = owner"
                class="px-5 py-2.5 rounded-xl text-lg font-bold transition-all border-2 cursor-pointer"
                :class="
                  activeOwnerFilter === owner
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-400 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                "
              >
                {{ owner }}
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="space-y-3  md:col-span-2 lg:col-span-1">
            <label
              class="block text-xl font-bold text-slate-600 dark:text-slate-400"
              >ประเภทเสื้อผ้า</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="activeCategoryFilter = cat"
                class="px-5 py-2.5 rounded-xl text-lg font-bold transition-all border-2 cursor-pointer"
                :class="
                  activeCategoryFilter === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-400 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                "
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Pattern Filter -->
          <div class="space-y-3">
            <label
              class="block text-xl font-bold text-slate-600 dark:text-slate-400"
              >ลักษณะสี</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="pat in ['ทั้งหมด', 'สีพื้น', 'ลาย']"
                :key="pat"
                @click="activePatternFilter = pat"
                class="px-5 py-2.5 rounded-xl text-lg font-bold transition-all border-2 cursor-pointer"
                :class="
                  activePatternFilter === pat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-400 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                "
              >
                {{ pat }}
              </button>
            </div>
          </div>
          
        <!-- Solid Color Selection -->
        <div v-if="activePatternFilter === 'สีพื้น'" class="space-y-3 md:col-span-3">
          <label
            class="block text-xl font-bold text-slate-600 dark:text-slate-400"
            >สีพื้น</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in solidColors"
              :key="color.name"
              @click="selectColor(color.name)"
              class="relative px-12 py-6 hover:scale-103 rounded-xl text-lg font-bold transition-all border-2 border-neutral-600 dark:border-neutral-50 flex items-center justify-center cursor-pointer"
              :class="
                selectedColors.includes(color.name)
                  ? ' ring-2 ring-indigo-500'
                  : ''
              "
              :style="{
                backgroundColor: color.code,
                color: '#fff',
                borderColor: selectedColors.includes(color.name)
                  ? color.code
                  : '',
              }"
            >
              <svg
                v-if="selectedColors.includes(color.name)"
                xmlns="http://www.w3.org/2000/svg"
                class="bg-indigo-500 rounded-full p-1 absolute inset-0 m-auto h-8 w-8 shadow "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Pattern Multi-Color Selection -->
        <div v-else-if="activePatternFilter === 'ลาย'" class="space-y-3 md:col-span-3">
          <label
            class="block text-xl font-bold text-slate-600 dark:text-slate-400"
            >สีลาย (เลือกได้มากกว่า 1 สี)</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in solidColors"
              :key="color.name"
              @click="selectColor(color.name)"
              class="relative px-12 py-6 hover:scale-103 rounded-xl text-lg font-bold transition-all border-2 border-neutral-600 dark:border-neutral-50 flex items-center justify-center cursor-pointer"
              :class="
                selectedColors.includes(color.name)
                  ? ' ring-2 ring-indigo-500'
                  : ''
              "
              :style="{
                backgroundColor: color.code,
                color: '#fff',
                borderColor: selectedColors.includes(color.name)
                  ? color.code
                  : '',
              }"
            >
              <svg
                v-if="selectedColors.includes(color.name)"
                xmlns="http://www.w3.org/2000/svg"
                class="bg-indigo-500 rounded-full p-1 absolute inset-0 m-auto h-8 w-8 shadow "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </button>
        </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24 space-y-4"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"
        ></div>
        <p class="text-xl font-bold text-slate-500 dark:text-slate-400">
          กำลังโหลดข้อมูลเสื้อผ้า...
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredClothes.length === 0"
        class="bg-slate-100 dark:bg-slate-800 rounded-3xl p-16 text-center shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <div
          class="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          ไม่พบเสื้อผ้า
        </h3>
        <p class="text-xl text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          ยังไม่มีเสื้อผ้าที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนตัวกรอง
          หรือเพิ่มเสื้อผ้าใหม่เลย!
        </p>
      </div>

      <!-- Grid Content -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <ClothingCard
          v-for="item in filteredClothes"
          :ownerColors="ownerColors"
          :key="item.id"
          :item="item"
          @edit="openEditModal"
          @delete="triggerDelete"
          @click="openDetailModal(item)"
        />
      </div>
    </main>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Add/Edit Modal -->
      <FormModal
        v-if="isFormModalOpen"
        :show="isFormModalOpen"
        :item="itemToEdit"
        :saving="actionLoading"
        @close="isFormModalOpen = false"
        @save="handleFormSave"
      />

      <!-- Detail Modal -->
      <DetailModal
        v-if="isDetailModalOpen"
        :ownerColors="ownerColors"
        :show="isDetailModalOpen"
        :item="selectedItem"
        @close="isDetailModalOpen = false"
      />

      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        v-if="isConfirmDeleteOpen"
        :show="isConfirmDeleteOpen"
        :loading="actionLoading"
        @close="isConfirmDeleteOpen = false"
        @confirm="handleDeleteConfirm"
      />
    </Teleport>
  </div>
</template>
