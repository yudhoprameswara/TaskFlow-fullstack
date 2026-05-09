<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { taskService } from '@/api/taskService';
import TaskCard from '@/components/TaskCard.vue';
import TaskForm from '@/components/TaskForm.vue';
import Navbar from '@/components/Navbar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import type { Task, TaskFormData, TaskStatus } from '@/types';

const tasks = ref<Task[]>([]);
const total = ref(0);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const searchQuery = ref('');
const activeFilter = ref<string>('');

const showModal = ref(false);
const showConfirm = ref(false);
const editingTask = ref<Task | null>(null);
const taskToDelete = ref<string | null>(null);
const isDeleting = ref(false);
const deletingId = ref<string | null>(null);

const stats = ref({
  total: 0,
  pending: 0,
  inProgress: 0,
  done: 0,
});

const fetchTasks = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await taskService.getTasks({
      status: activeFilter.value || undefined,
      search: searchQuery.value || undefined,
    });
    tasks.value = res.data ?? [];
    total.value = res.total;
    
    if (res.stats) {
      stats.value = {
        total: res.stats.total,
        pending: res.stats.pending,
        inProgress: res.stats['in-progress'],
        done: res.stats.done,
      };
    }
  } catch {
    error.value = 'Failed to load tasks. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchTasks, 350);
});

watch(activeFilter, fetchTasks);
onMounted(fetchTasks);

const openCreateModal = () => {
  editingTask.value = null;
  showModal.value = true;
};

const openEditModal = (task: Task) => {
  editingTask.value = task;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTask.value = null;
};

const handleSubmit = async (formData: TaskFormData) => {
  isSubmitting.value = true;
  try {
    const payload = {
      ...formData,
      deadline: formData.deadline
        ? new Date(formData.deadline).toISOString()
        : undefined,
    };

    if (editingTask.value) {
      await taskService.updateTask(editingTask.value._id, payload);
    } else {
      await taskService.createTask(payload);
    }

    closeModal();
    await fetchTasks();
  } catch (err: unknown) {
    const apiErr = err as { response?: { data?: { message?: string } } };
    error.value = apiErr.response?.data?.message ?? 'Failed to save task';
  } finally {
    isSubmitting.value = false;
  }
};

const handleStatusChange = async (id: string, newStatus: string) => {
  const task = tasks.value.find((t) => t._id === id);
  if (!task) return;
  task.status = newStatus as TaskStatus;
  try {
    await taskService.updateTask(id, { status: newStatus as TaskStatus });
  } catch {
    await fetchTasks();
  }
};

const confirmDelete = (id: string) => {
  taskToDelete.value = id;
  showConfirm.value = true;
};

const handleDelete = async () => {
  if (!taskToDelete.value) return;
  
  isDeleting.value = true;
  deletingId.value = taskToDelete.value;
  try {
    await taskService.deleteTask(taskToDelete.value);
    tasks.value = tasks.value.filter((t) => t._id !== taskToDelete.value);
    total.value--;
    showConfirm.value = false;
  } catch {
    error.value = 'Failed to delete task';
  } finally {
    isDeleting.value = false;
    deletingId.value = null;
    taskToDelete.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <Navbar />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
        </div>
        <button id="create-task-btn" class="btn-primary shrink-0" @click="openCreateModal">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          class="relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden text-left h-28"
          :class="activeFilter === '' 
            ? 'bg-brand-600 text-white shadow-xl shadow-brand-200 ring-1 ring-brand-600' 
            : 'bg-white border border-slate-100 text-slate-600 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1'"
          @click="activeFilter = ''"
        >
          <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="text-[10px] font-black uppercase tracking-widest opacity-60">All Tasks</div>
            <div class="text-3xl font-black tabular-nums tracking-tighter">{{ stats.total }}</div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-all duration-300 transform rotate-12 group-hover:rotate-0">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="activeFilter === ''" class="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
        </button>

        <button
          class="relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden text-left h-28"
          :class="activeFilter === 'pending' 
            ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 ring-1 ring-amber-500' 
            : 'bg-white border border-slate-100 text-slate-600 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-1'"
          @click="activeFilter = 'pending'"
        >
          <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="text-[10px] font-black uppercase tracking-widest opacity-80">Pending</div>
            <div class="text-3xl font-black tabular-nums tracking-tighter">{{ stats.pending }}</div>
          </div>

          <div class="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-all duration-300 transform rotate-12 group-hover:rotate-0">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="1.5" />
              <path d="M12 7v5l3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="activeFilter === 'pending'" class="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
        </button>

        <button
          class="relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden text-left h-28"
          :class="activeFilter === 'in-progress' 
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-1 ring-blue-600' 
            : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1'"
          @click="activeFilter = 'in-progress'"
        >
          <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="text-[10px] font-black uppercase tracking-widest opacity-80">In Progress</div>
            <div class="text-3xl font-black tabular-nums tracking-tighter">{{ stats.inProgress }}</div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-all duration-300 transform rotate-12 group-hover:rotate-0">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="activeFilter === 'in-progress'" class="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
        </button>

        <button
          class="relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden text-left h-28"
          :class="activeFilter === 'done' 
            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 ring-1 ring-emerald-600' 
            : 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1'"
          @click="activeFilter = 'done'"
        >
          <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="text-[10px] font-black uppercase tracking-widest opacity-80">Completed</div>
            <div class="text-3xl font-black tabular-nums tracking-tighter">{{ stats.done }}</div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-all duration-300 transform rotate-12 group-hover:rotate-0">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="1.5" />
              <path d="M8 12l3 3 5-5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="activeFilter === 'done'" class="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <div class="relative flex-1">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="task-search"
            v-model="searchQuery"
            type="search"
            placeholder="Search tasks…"
            class="input pl-10"
          />
        </div>
      </div>

      <Transition name="slide-down">
        <div v-if="error" class="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2">
          <p class="text-red-600 text-sm">{{ error }}</p>
          <button class="text-red-500 hover:text-red-700 shrink-0" @click="error = null">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <div class="relative min-h-[400px]">
        <div v-if="isLoading && tasks.length > 0" class="absolute -top-3 left-0 right-0 z-20">
          <div class="h-0.5 w-full bg-slate-100 overflow-hidden rounded-full">
            <div class="h-full bg-brand-500 animate-progress w-1/2"></div>
          </div>
        </div>

        <Transition name="fade" mode="out-in">
          <div v-if="isLoading && tasks.length === 0" key="loading" class="space-y-3">
            <div v-for="n in 4" :key="n" class="card animate-pulse">
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-slate-100 shrink-0 mt-0.5"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <TransitionGroup 
            v-else-if="tasks.length > 0" 
            key="list"
            name="task-list" 
            tag="div" 
            class="space-y-2.5 transition-all duration-300"
            :class="{ 'opacity-50 pointer-events-none blur-[0.5px]': isLoading }"
          >
            <TaskCard
              v-for="task in tasks"
              :key="task._id"
              :task="task"
              @edit="openEditModal"
              @delete="confirmDelete"
              @status-change="handleStatusChange"
            />
          </TransitionGroup>

          <div v-else-if="!isLoading" key="empty" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-slate-900 font-semibold mb-1">
              {{ searchQuery ? 'No tasks found' : 'No tasks yet' }}
            </h3>
            <p class="text-slate-500 text-sm">
              {{ searchQuery
                ? `No tasks match "${searchQuery}"`
                : 'Create your first task to get started' }}
            </p>
            <button v-if="!searchQuery" class="btn-primary mt-5" @click="openCreateModal">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create first task
            </button>
          </div>
        </Transition>
      </div>
    </main>

    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <Transition name="slide-up">
          <div v-if="showModal" class="w-full max-w-lg card border-white shadow-2xl shadow-slate-900/10 animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-semibold text-slate-900 text-lg">
                {{ editingTask ? 'Edit task' : 'New task' }}
              </h2>
              <button class="btn-ghost p-1.5" @click="closeModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <TaskForm
              :task="editingTask"
              :is-loading="isSubmitting"
              @submit="handleSubmit"
              @cancel="closeModal"
            />
          </div>
        </Transition>
      </div>
    </Transition>
    <ConfirmModal
      :show="showConfirm"
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirm-text="Delete"
      variant="danger"
      :is-loading="isDeleting"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<style scoped>
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.25s ease;
}
.task-list-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.task-list-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.task-list-move {
  transition: transform 0.25s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
.animate-progress {
  animation: progress 2s infinite ease-in-out;
}
</style>
