<script setup lang="ts">
import { ref, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { ApiErrorResponse, ValidationError } from '@/types';

const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const fieldErrors = ref<Record<string, string>>({});
const showPassword = ref(false);

const handleSubmit = async () => {
  fieldErrors.value = {};
  try {
    await authStore.login({ email: form.email, password: form.password });
  } catch (err: unknown) {
    const apiErr = err as { response?: { data?: ApiErrorResponse } };
    const errData = apiErr.response?.data;
    if (errData?.errors) {
      errData.errors.forEach((e: ValidationError) => {
        fieldErrors.value[e.field] = e.message;
      });
    }
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute -top-40 -right-32 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-32 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md animate-fade-in">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-xl mb-4 shadow-lg shadow-brand-200">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
        <p class="text-slate-500 text-sm mt-1.5">Sign in to your TaskFlow account</p>
      </div>

      <div class="card border-white shadow-xl shadow-slate-200/60">
        <Transition name="slide-down">
          <div v-if="authStore.error" class="mb-5 p-3.5 bg-red-50 border border-red-100
               rounded-lg flex items-start gap-2.5 animate-slide-down">
            <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clip-rule="evenodd" />
            </svg>
            <p class="text-red-600 text-sm">{{ authStore.error }}</p>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
          <div>
            <label for="login-email" class="label">Email address</label>
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :class="['input', fieldErrors.email ? 'border-red-500 focus:ring-red-500' : '']"
              @focus="authStore.clearError"
            />
            <p v-if="fieldErrors.email" class="error-text">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label for="login-password" class="label">Password</label>
            <div class="relative">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :class="['input pr-10', fieldErrors.password ? 'border-red-500 focus:ring-red-500' : '']"
                @focus="authStore.clearError"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600
                       transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="fieldErrors.password" class="error-text">{{ fieldErrors.password }}</p>
          </div>

          <button
            type="submit"
            class="btn-primary w-full mt-2"
            :disabled="authStore.isLoading"
          >
            <svg v-if="authStore.isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ authStore.isLoading ? 'Signing in…' : 'Sign in' }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-slate-500 mt-5">
          Don't have an account?
          <RouterLink to="/register" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Create one
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
