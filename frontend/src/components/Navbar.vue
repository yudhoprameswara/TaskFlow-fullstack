<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const showDropdown = ref(false);

const handleLogout = () => {
  showDropdown.value = false;
  authStore.logout();
};

const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
};
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-200/50">
          <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span class="font-bold text-slate-900 text-lg tracking-tight">TaskFlow</span>
      </div>

      <div class="relative">
        <button
          class="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100
                 transition-colors group"
          @click="showDropdown = !showDropdown"
          @blur="closeDropdown"
        >
          <div class="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div class="text-left hidden sm:block">
            <div class="text-sm font-medium text-slate-900 leading-tight">{{ authStore.user?.name }}</div>
            <div class="text-xs text-slate-500 leading-tight">{{ authStore.user?.email }}</div>
          </div>
          <svg class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': showDropdown }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition name="slide-down">
          <div v-if="showDropdown"
            class="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl
                   shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-slide-down">
            <div class="px-3.5 py-2.5 border-b border-slate-100 sm:hidden">
              <div class="text-sm font-medium text-slate-900">{{ authStore.user?.name }}</div>
              <div class="text-xs text-slate-500">{{ authStore.user?.email }}</div>
            </div>
            <button
              class="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-600
                     hover:bg-red-50 hover:text-red-700 transition-colors"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
