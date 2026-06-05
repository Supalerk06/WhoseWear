<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  ownerColors: {
    type: Object,
    required: true
  },
});

const emit = defineEmits(['view-detail', 'edit', 'delete']);

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// Close dropdown if clicking outside the dropdown container
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleView = () => {
  closeDropdown();
  emit('view-detail', props.item);
};

const handleEdit = () => {
  closeDropdown();
  emit('edit', props.item);
};

const handleDelete = () => {
  closeDropdown();
  emit('delete', props.item);
};
</script>

<template>
  <div 
    class="group relative h-full max-h-[360px] flex flex-col bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    @click="handleView"
  >
    <!-- Image Section -->
    <div class="relative w-full aspect-square bg-slate-50 dark:bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-800">
      <img 
        :src="item.image_url" 
        :alt="item.name" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      <!-- Owner Badge Overlay (Very clear, highly visible for elderly) -->
      <div class="absolute bottom-4 left-4">
        <span
          class="flex gap-1 items-center justify-center px-4 py-2 text-xl font-bold rounded-2xl shadow-md border"
          :class="ownerColors[item.owner]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg>{{ item.owner }} 
        </span>
      </div>

      <!-- Action Button Dropdown -->
      <div ref="dropdownRef" class="absolute top-4 right-4" >
        <button 
          class="size-11 cursor-pointer rounded-full bg-white/95 dark:bg-slate-900/95 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-95 transition-all duration-150 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="เมนูตัวเลือก"
          @click.stop="toggleDropdown"
        >
          <!-- Three Dots Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <!-- Dropdown Menu Options -->
        <Transition name="dropdown">
          <div 
            v-if="isDropdownOpen" 
            class="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-20 overflow-hidden"
          >
            <div>
              <button 
                class="cursor-pointer w-full text-left px-5 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 min-h-[48px]"
                @click="handleView"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดูรายละเอียด
              </button>
              
              <button 
                class="cursor-pointer w-full text-left px-5 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/50 min-h-[48px]"
                @click.stop="handleEdit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไขข้อมูล
              </button>
              
              <button 
                class="cursor-pointer w-full text-left px-5 py-4 text-lg font-bold text-red-650 hover:bg-red-100 dark:hover:bg-red-950/20 transition-colors flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/50 min-h-[48px]"
                @click.stop="handleDelete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบเสื้อผ้า
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Metadata Details -->
    <div class="p-5 flex flex-col justify-between flex-grow">
      <div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1.5" :title="item.name">
          {{ item.name }}
        </h3>
        <p class="text-lg font-semibold text-slate-400 dark:text-slate-500">
          ประเภท: <span class="text-slate-600 dark:text-slate-300 font-bold">{{ item.category }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
