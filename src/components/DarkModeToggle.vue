<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('ww_dark_mode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('ww_dark_mode', 'false');
  }
};

onMounted(() => {
  const saved = localStorage.getItem('ww_dark_mode');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (saved === 'true' || (saved === null && systemPrefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
});
</script>

<template>
  <button 
    class="flex items-center gap-3 px-5 py-3 text-lg font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl transition-all duration-150 min-h-[52px] border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300"
    aria-label="สลับโหมดมืดโหมดสว่าง"
    @click="toggleDarkMode"
  >
    <!-- Sun/Moon Icon -->
    <svg 
      v-if="isDark" 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-6 w-6 text-yellow-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      stroke-width="2.5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
    <svg 
      v-else 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-6 w-6 text-indigo-650" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      stroke-width="2.5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <span>{{ isDark ? 'โหมดสว่าง' : 'โหมดมืด' }}</span>
  </button>
</template>
