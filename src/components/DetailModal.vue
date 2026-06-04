<script setup>
import BaseModal from "./BaseModal.vue";
import { computed } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  item: {
    type: Object,
    default: null,
  },
  ownerColors: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const formattedDate = computed(() => {
  if (!props.item || !props.item.created_at) return "";
  try {
    const date = new Date(props.item.created_at);
    return (
      date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " น."
    );
  } catch (e) {
    return props.item.created_at;
  }
});
</script>

<template>
  <BaseModal
    :show="show"
    :title="item?.name || 'รายละเอียดเสื้อผ้า'"
    @close="emit('close')"
  >
    <div v-if="item" class="flex flex-col md:flex-row gap-8 py-2">
      <!-- Large Image Panel -->
      <div
        class="w-full md:w-6/8 h-full flex items-center rounded-3xl overflow-hidden justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 shadow-sm"
      >
        <img
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-contain"
        />
        <!-- </div> -->
      </div>

      <!-- Details List Panel -->
      <div class="w-full md:w-2/8 flex flex-col justify-between gap-6">
        <div class="space-y-6">
          <!-- Owner Section -->
          <div class="flex items-center justify-start gap-2">
            <p
              class="flex flex-wrap items-center md:block gap-2 text-lg text-slate-500 dark:text-slate-400 mb-1 font-medium"
            >
              เจ้าของเสื้อผ้า :
              <span
                class="inline-flex items-center px-5 py-2 text-2xl font-bold rounded-2xl border mt-2"
                :class="ownerColors[item.owner]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-7 w-7 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ item.owner }}
              </span>
            </p>
          </div>

          <!-- Category Section -->
          <div class="flex items-center justify-start gap-2">
            <p
              class="flex flex-wrap items-center md:block gap-2 text-lg text-slate-500 dark:text-slate-400 mb-1 font-medium"
            >
              ประเภทเสื้อผ้า :
              <span
                class="text-2xl text-slate-700 dark:text-slate-100 md:inline-flex"
              >
                {{ item.category }}
              </span>
            </p>
          </div>

          <!-- Type Section -->
          <div>
            <p
              class="flex flex-wrap items-center md:block gap-2 text-lg text-slate-500 dark:text-slate-400 mb-1 font-medium"
            >
              ลักษณะลายเสื้อ :
              <span
                class="block text-2xl text-slate-700 dark:text-slate-100 md:inline-flex"
              >
                {{
                  item.pattern_type === "pattern"
                    ? "เป็นลาย (มีหลายสี)"
                    : "สีพื้น (สีเดี่ยวๆ)"
                }}
              </span>
            </p>
          </div>

          <!-- Colors List Section -->
          <div class="flex flex-wrap items-center gap-2 md:block">
            <p
              class="text-lg text-slate-500 dark:text-slate-400 block mb-2 font-medium"
            >
              โทนสีเสื้อผ้า :
            </p>

            <div class="flex flex-wrap gap-3">
              <span
                v-for="color in item.colors"
                :key="color"
                class="px-5 py-2 text-slate-800 text-xl font-bold rounded-2xl border-2 shadow-sm"
                :class="{
                  'bg-white text-black border-gray-300': color === 'ขาว',
                  'bg-black text-white border-black': color === 'ดำ',
                  'bg-gray-500 text-white border-gray-600': color === 'เทา',
                  'bg-red-500 text-white border-red-600': color === 'แดง',
                  'bg-pink-400 text-white border-pink-500': color === 'ชมพู',
                  'bg-green-600 text-white border-green-700': color === 'เขียว',
                  'bg-sky-400 text-black border-sky-500': color === 'ฟ้า',
                  'bg-blue-600 text-white border-blue-700': color === 'น้ำเงิน',
                  'bg-yellow-300 text-black border-yellow-400':
                    color === 'เหลือง',
                  'bg-orange-500 text-white border-orange-600': color === 'ส้ม',
                  'bg-purple-600 text-white border-purple-700':
                    color === 'ม่วง',
                  'bg-amber-800 text-white border-amber-900':
                    color === 'น้ำตาล',
                  'bg-[#DDB4A5] text-black border-[#C79A8A]': color === 'ครีม',
                }"
              >
                {{ color }}
              </span>
            </div>
          </div>
          <!-- Date Added Footer -->
          <div
            class="pt-6 border-t border-slate-300 dark:border-slate-800 text-lg text-slate-400 dark:text-slate-500"
          >
            <span class="flex flex-wrap items-center md:block gap-2 text-lg text-slate-500 dark:text-slate-400 mb-1 font-medium">วันที่บันทึกเข้าระบบ : </span>
            <span
              class="font-bold text-slate-700 dark:text-slate-300 block mt-1.5"
              >{{ formattedDate }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
