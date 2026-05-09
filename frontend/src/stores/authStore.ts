import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/api/authService';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // ─── State ────────────────────────────────────────────────────────────────
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.register(credentials);
      if (response.data) {
        setAuth(response.data.token, response.data.user);
        await router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      if (response.data) {
        setAuth(response.data.token, response.data.user);
        await router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    router.push('/login');
  };

  const fetchMe = async (): Promise<void> => {
    if (!token.value) return;
    try {
      const response = await authService.getMe();
      if (response.data) {
        user.value = response.data;
      }
    } catch {
      logout();
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    fetchMe,
    clearError,
  };
});

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}
