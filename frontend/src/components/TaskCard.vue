<script setup lang="ts">
import type { Task } from '@/types';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'delete', id: string): void;
  (e: 'status-change', id: string, status: string): void;
}>();

const formatDeadline = (deadline?: string) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const isOverdue = (deadline?: string) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date() && props.task.status !== 'done';
};

const statusCycle: Record<string, string> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
};
</script>

<template>
  <div class="card-hover animate-slide-up group">
    <div class="flex items-start gap-3">
      <button
        class="mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200
               flex items-center justify-center"
        :class="{
          'border-amber-400 hover:border-amber-500 hover:bg-amber-50': task.status === 'pending',
          'border-blue-400 hover:border-blue-500 hover:bg-blue-50 bg-blue-50': task.status === 'in-progress',
          'border-emerald-500 bg-emerald-500 hover:bg-emerald-600': task.status === 'done',
        }"
        :title="`Mark as ${statusCycle[task.status]}`"
        @click="$emit('status-change', task._id, statusCycle[task.status])"
      >
        <svg v-if="task.status === 'done'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
        <div v-else-if="task.status === 'in-progress'" class="w-2 h-2 rounded-full bg-blue-500"></div>
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-slate-800 text-sm leading-snug"
            :class="{ 'line-through text-slate-400': task.status === 'done' }">
            {{ task.title }}
          </h3>
          <span :class="{
            'badge-pending': task.status === 'pending',
            'badge-in-progress': task.status === 'in-progress',
            'badge-done': task.status === 'done',
          }" class="shrink-0">
            {{ task.status === 'in-progress' ? 'In Progress' : task.status }}
          </span>
        </div>

        <p v-if="task.description" class="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">
          {{ task.description }}
        </p>

        <div class="flex items-center justify-between mt-2.5">
          <div v-if="task.deadline" class="flex items-center gap-1 text-xs"
            :class="isOverdue(task.deadline) ? 'text-red-500' : 'text-slate-400'">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ isOverdue(task.deadline) ? 'Overdue · ' : '' }}{{ formatDeadline(task.deadline) }}</span>
          </div>
          <div v-else class="text-xs text-slate-300">No deadline</div>

          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="btn-ghost p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
              title="Edit task"
              @click="$emit('edit', task)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="btn-ghost p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Delete task"
              @click="$emit('delete', task._id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
