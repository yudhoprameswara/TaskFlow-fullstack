<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchMe();
  }
});
</script>

<template>
  <div id="app-root" class="min-h-screen bg-slate-950">
    <RouterView v-slot="{ Component, route }">
      <Transition
        :name="route.meta.requiresAuth ? 'slide-up' : 'fade'"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
