<script setup>
import BaseModal from './BaseModal.vue';

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'ยืนยันการลบ'
  },
  message: {
    type: String,
    default: 'ยืนยันที่จะลบเสื้อไหม?'
  }
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <BaseModal :show="show" :title="title" @close="emit('close')">
    <div class="flex flex-col items-center text-center py-4">
      <!-- Warning Trash Icon -->
      <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <p class="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
        {{ message }}
      </p>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">
        เมื่อลบแล้ว ข้อมูลเสื้อผ้าและรูปภาพนี้จะหายไปจากระบบทันที
      </p>
    </div>

    <template #footer>
      <!-- Large buttons designed for elderly touch targets -->
      <div class="flex w-full gap-4">
        <button 
          type="button"
          class="flex-1 py-4 px-6 text-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-300 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 transition-colors duration-150 min-h-[56px] flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
          @click="emit('close')"
        >
          ยกเลิก
        </button>
        <button 
          type="button"
          class="flex-1 py-4 px-6 text-xl font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-200 dark:shadow-none transition-colors duration-150 min-h-[56px] flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
          @click="emit('confirm')"
        >
          ยืนยันลบ
        </button>
      </div>
    </template>
  </BaseModal>
</template>
