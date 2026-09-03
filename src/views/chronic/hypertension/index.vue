<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
import HypertensionFilters from './components/HypertensionFilters.vue'
import HypertensionTable from './components/HypertensionTable.vue'
import { useHypertensionList } from './composables/useHypertensionList'
import type { HypertensionRecord } from './types'

const showAdvanced = shallowRef(false)
const {
  filters,
  loading,
  loadRows,
  nextPage,
  pageCount,
  pagination,
  previousPage,
  removeRecord,
  resetFilters,
  rows,
  search,
  total,
  updateManagement,
} = useHypertensionList()

function editRecord(_record: HypertensionRecord) {
  toast.info('高血压档案编辑表单正在迁移')
}

async function confirmRemove(record: HypertensionRecord) {
  if (!window.confirm(`确认删除${record.XM ?? ''}的高血压档案吗？`)) return
  await removeRecord(record)
}

onMounted(loadRows)
</script>

<template>
  <main class="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">高血压管理</h1>
        <p class="text-sm text-muted-foreground">维护高血压患者档案、管理状态与随访入口</p>
      </div>
      <Button @click="toast.info('高血压档案新增表单正在迁移')">
        <Icon icon="mdi:plus" data-icon="inline-start" />
        新增档案
      </Button>
    </header>

    <HypertensionFilters
      v-model:search-text="filters.searchText"
      v-model:archive-status="filters.zt"
      v-model:management-status="filters.iState"
      :advanced="showAdvanced"
      @reset="resetFilters"
      @search="search"
      @toggle-advanced="showAdvanced = !showAdvanced"
    />

    <HypertensionTable
      :loading="loading"
      :rows="rows"
      @edit="editRecord"
      @remove="confirmRemove"
      @update-management="updateManagement"
    />

    <footer class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>共 {{ total }} 条记录</span>
      <div class="flex items-center gap-2">
        <Button size="sm" variant="outline" :disabled="pagination.pageIndex === 0 || loading" @click="previousPage">上一页</Button>
        <span>第 {{ pagination.pageIndex + 1 }} / {{ pageCount }} 页</span>
        <Button size="sm" variant="outline" :disabled="pagination.pageIndex + 1 >= pageCount || loading" @click="nextPage">下一页</Button>
      </div>
    </footer>
  </main>
</template>
