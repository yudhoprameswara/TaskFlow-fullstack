<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <Transition name="zoom">
        <div v-if="show" class="w-full max-w-sm bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-zoom">
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                :class="{
                  'bg-red-50 text-red-500': variant === 'danger',
                  'bg-amber-50 text-amber-500': variant === 'warning',
                  'bg-brand-50 text-brand-600': variant === 'info' || !variant
                }"
              >
                <svg v-if="variant === 'danger'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg v-else-if="variant === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">{{ title }}</h3>
                <p class="text-slate-500 text-sm mt-1">{{ message }}</p>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                type="button"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200"
                @click="$emit('cancel')"
                :disabled="isLoading"
              >
                {{ cancelText || 'Cancel' }}
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-lg"
                :class="{
                  'bg-red-500 hover:bg-red-600 shadow-red-200': variant === 'danger',
                  'bg-brand-600 hover:bg-brand-700 shadow-brand-200': variant !== 'danger'
                }"
                @click="$emit('confirm')"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span v-else>{{ confirmText || 'Confirm' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.zoom-enter-active, .zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-enter-from, .zoom-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>

