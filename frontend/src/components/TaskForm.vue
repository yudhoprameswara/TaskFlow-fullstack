<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Task, TaskFormData, TaskStatus } from '@/types';
import CustomSelect from './CustomSelect.vue';
import CustomDatePicker from './CustomDatePicker.vue';

const props = defineProps<{
  task?: Task | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: TaskFormData): void;
  (e: 'cancel'): void;
}>();

const form = reactive<TaskFormData>({
  title: '',
  description: '',
  status: 'pending',
  deadline: '',
});

watch(
  () => props.task,
  (task) => {
    if (task) {
      form.title = task.title;
      form.description = task.description ?? '';
      form.status = task.status;
      form.deadline = task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : '';
    } else {
      form.title = '';
      form.description = '';
      form.status = 'pending';
      form.deadline = '';
    }
  },
  { immediate: true }
);

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
    <div>
      <label for="task-title" class="label">
        Task title
        <span class="text-red-400 ml-0.5">*</span>
      </label>
      <input
        id="task-title"
        v-model="form.title"
        type="text"
        required
        placeholder="e.g. Design homepage mockup"
        class="input"
      />
    </div>

    <div>
      <label for="task-desc" class="label">Description</label>
      <textarea
        id="task-desc"
        v-model="form.description"
        rows="3"
        placeholder="Add more details about this task…"
        class="input resize-none"
      ></textarea>
    </div>
    <!-- Status & Deadline row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="task-status" class="label">Status</label>
        <CustomSelect
          v-model="form.status"
          :options="statusOptions"
        />
      </div>
      <div>
        <label for="task-deadline" class="label">Deadline</label>
        <CustomDatePicker v-model="form.deadline" />
      </div>
    </div>

    <div class="flex gap-2.5 pt-1">
      <button
        type="submit"
        class="btn-primary flex-1"
        :disabled="isLoading || !form.title.trim()"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ task ? 'Update task' : 'Create task' }}
      </button>
      <button type="button" class="btn-secondary" @click="$emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>
