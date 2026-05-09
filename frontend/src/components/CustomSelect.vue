<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const selectedLabel = ref('');

const updateLabel = () => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  selectedLabel.value = selected ? selected.label : props.placeholder || 'Select option';
};

onMounted(() => {
  updateLabel();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

import { watch } from 'vue';
watch(() => props.modelValue, updateLabel);
</script>

<template>
  <div class="relative" ref="selectRef">
    <button
      type="button"
      class="input min-h-[42px] text-left flex items-center justify-between group"
      @click="toggle"
    >
      <div class="flex items-center gap-2.5">
        <div 
          v-if="modelValue"
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-amber-500': modelValue === 'pending',
            'bg-blue-500': modelValue === 'in-progress',
            'bg-emerald-500': modelValue === 'done'
          }"
        ></div>
        <span :class="modelValue ? 'text-slate-900' : 'text-slate-400'">
          {{ selectedLabel }}
        </span>
      </div>
      <svg 
        class="w-4 h-4 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="fade-slide">
      <div 
        v-if="isOpen"
        class="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/60 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center gap-3"
          :class="modelValue === opt.value ? 'bg-slate-50 text-brand-600 font-medium' : 'text-slate-600 hover:bg-slate-50'"
          @click="selectOption(opt.value)"
        >
          <div 
            class="w-1.5 h-1.5 rounded-full"
            :class="{
              'bg-amber-500': opt.value === 'pending',
              'bg-blue-500': opt.value === 'in-progress',
              'bg-emerald-500': opt.value === 'done'
            }"
          ></div>
          {{ opt.label }}
          <svg v-if="modelValue === opt.value" class="w-4 h-4 ml-auto text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
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
</style>
