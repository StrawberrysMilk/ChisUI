<script setup lang="ts">
import { Icon } from '@iconify/vue'

const searchText = defineModel<string>('searchText', { required: true })
const archiveStatus = defineModel<string>('archiveStatus', { required: true })
const managementStatus = defineModel<string>('managementStatus', { required: true })

defineProps<{ advanced: boolean }>()
const emit = defineEmits<{ reset: []; search: []; toggleAdvanced: [] }>()
</script>

<template>
  <section class="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
    <label class="flex min-w-56 flex-1 flex-col gap-1 text-sm">
      <span class="text-muted-foreground">关键词</span>
      <Input v-model="searchText" placeholder="档案号、身份证号或姓名" @keyup.enter="emit('search')" />
    </label>
    <label class="flex w-36 flex-col gap-1 text-sm">
      <span class="text-muted-foreground">档案状态</span>
      <select v-model="archiveStatus" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">全部</option>
        <option value="1">正常</option>
        <option value="0">死亡</option>
      </select>
    </label>
    <label class="flex w-36 flex-col gap-1 text-sm">
      <span class="text-muted-foreground">管理状态</span>
      <select v-model="managementStatus" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">全部</option>
        <option value="1">管理中</option>
        <option value="0">暂不管理</option>
      </select>
    </label>
    <Button @click="emit('search')">
      <Icon icon="mdi:magnify" data-icon="inline-start" />查询
    </Button>
    <Button variant="ghost" @click="emit('reset')">重置</Button>
    <Button variant="outline" @click="emit('toggleAdvanced')">
      <Icon :icon="advanced ? 'mdi:chevron-up' : 'mdi:chevron-down'" data-icon="inline-start" />高级筛选
    </Button>
    <div v-if="advanced" class="basis-full border-t pt-3 text-sm text-muted-foreground">
      高级查询条件将在后续迁移中接入原系统的字段配置。
    </div>
  </section>
</template>
