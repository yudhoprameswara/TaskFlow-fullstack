<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  modelValue?: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const now = new Date();
const viewDate = ref(props.modelValue ? new Date(props.modelValue) : new Date());
const selectedDate = computed(() => props.modelValue ? new Date(props.modelValue) : null);

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  const days = [];
  
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }
  
  const totalSlots = 42;
  const nextMonthPadding = totalSlots - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: year,
      isCurrentMonth: false
    });
  }
  
  return days;
});

const isSelected = (d: any) => {
  if (!selectedDate.value) return false;
  return selectedDate.value.getDate() === d.day &&
         selectedDate.value.getMonth() === d.month &&
         selectedDate.value.getFullYear() === d.year;
};

const isToday = (d: any) => {
  return now.getDate() === d.day &&
         now.getMonth() === d.month &&
         now.getFullYear() === d.year;
};

const nextMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
};

const prevMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
};

const selectDate = (d: any) => {
  const current = selectedDate.value || new Date();
  const newDate = new Date(d.year, d.month, d.day, current.getHours(), current.getMinutes());
  emit('update:modelValue', newDate.toISOString());
};

const selectedTime = computed({
  get: () => {
    const d = selectedDate.value || new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },
  set: (val: string) => {
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const d = selectedDate.value ? new Date(selectedDate.value) : new Date();
    d.setHours(h, m, 0, 0);
    emit('update:modelValue', d.toISOString());
  }
});

const formattedValue = computed(() => {
  if (!props.modelValue) return 'Select deadline';
  const d = new Date(props.modelValue);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

</script>

<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      class="input min-h-[42px] text-left flex items-center gap-2.5 group"
      @click="isOpen = !isOpen"
    >
      <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span :class="modelValue ? 'text-slate-900' : 'text-slate-400'" class="truncate">{{ formattedValue }}</span>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="absolute z-50 mt-2 right-0 sm:left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-300/50 p-4 w-[300px] animate-in fade-in slide-in-from-top-2 duration-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-slate-900">{{ months[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}</h4>
          <div class="flex gap-1">
            <button type="button" @click="prevMonth" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button type="button" @click="nextMonth" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 mb-2">
          <div v-for="day in daysOfWeek" :key="day" class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ day }}</div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-4">
          <button
            v-for="(d, idx) in calendarDays"
            :key="idx"
            type="button"
            @click="selectDate(d)"
            class="aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200"
            :class="[
              d.isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
              isSelected(d) ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-200' : 'hover:bg-slate-50',
              isToday(d) && !isSelected(d) ? 'text-brand-600 font-bold ring-1 ring-brand-100' : ''
            ]"
          >
            {{ d.day }}
          </button>
        </div>

        <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase">Set Time</span>
          <div class="flex items-center bg-slate-50 rounded-lg p-1 group focus-within:ring-2 focus-within:ring-brand-500/20">
            <input
              type="time"
              v-model="selectedTime"
              class="bg-transparent border-none p-0 px-2 text-sm font-bold text-slate-900 focus:ring-0 w-[80px]"
            />
          </div>
        </div>

        <button
          type="button"
          @click="isOpen = false"
          class="w-full mt-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

input[type="time"]::-webkit-calendar-picker-indicator {
  display: none;
}
</style>
