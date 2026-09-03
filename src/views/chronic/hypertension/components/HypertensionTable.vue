<script setup lang="ts">
import { computed } from 'vue'
import { useAutoTableHeight } from '@/composables/useAutoTableHeight'
import type { HypertensionRecord } from '../types'

const props = defineProps<{ loading: boolean; rows: HypertensionRecord[] }>()
const emit = defineEmits<{
  edit: [record: HypertensionRecord]
  remove: [record: HypertensionRecord]
  updateManagement: [record: HypertensionRecord, managed: boolean]
}>()

function statusLabel(value: unknown, management = false) {
  if (management) return Number(value) === 1 ? '管理中' : '暂不管理'
  return Number(value) === 1 ? '正常' : Number(value) === 0 ? '死亡' : '其他'
}

const columns = [
  { field: 'DAH', title: '档案号', minWidth: 120 },
  { field: 'XM', title: '姓名', width: 96 },
  { field: 'SFZH', title: '身份证号', minWidth: 180 },
  { field: 'XB', title: '性别', width: 72, align: 'center' },
  { field: 'NL', title: '年龄', width: 72, align: 'center' },
  { field: 'JGMC', title: '管理机构', minWidth: 160 },
  { field: 'ZT', title: '档案状态', width: 100, align: 'center' },
  { field: 'IState', title: '管理状态', width: 100, align: 'center' },
  { field: 'GXYDJRQ', title: '登记日期', width: 120, align: 'center' },
  { field: 'LastSFRQ', title: '最近随访', width: 120, align: 'center' },
  { key: 'actions', title: '操作', width: 220, fixed: 'right', align: 'center' },
]

const hasRows = computed(() => props.rows.length > 0)
const { containerRef, containerStyle } = useAutoTableHeight({
  dataLength: () => props.rows.length,
  bottomOffset: 72,
  minHeight: 240,
})
</script>

<template>
  <section class="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
    <div ref="containerRef" :style="containerStyle" class="h-full overflow-auto">
      <div v-if="loading" class="flex h-32 items-center justify-center text-muted-foreground">加载中...</div>
      <div v-else-if="!hasRows" class="flex h-32 items-center justify-center text-muted-foreground">暂无高血压档案</div>
      <vxe-table v-else :data="rows" border="none" show-overflow class="h-full">
        <vxe-column
          v-for="column in columns"
          :key="column.key ?? column.field"
          :field="column.field"
          :title="column.title"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed as 'left' | 'right' | undefined"
          :align="column.align as 'left' | 'center' | 'right' | undefined"
        >
          <template #default="{ row }">
            <div v-if="column.key === 'actions'" class="flex flex-wrap gap-1">
              <Button size="sm" variant="ghost" @click="emit('edit', row)">编辑</Button>
              <Button size="sm" variant="ghost" @click="emit('updateManagement', row, Number(row.IState) !== 1)">
                {{ Number(row.IState) === 1 ? '暂不管理' : '纳入管理' }}
              </Button>
              <Button size="sm" variant="ghost" class="text-destructive" @click="emit('remove', row)">删除</Button>
            </div>
            <Badge v-else-if="column.field === 'IState'" :variant="Number(row.IState) === 1 ? 'default' : 'secondary'">
              {{ statusLabel(row.IState, true) }}
            </Badge>
            <template v-else-if="column.field === 'ZT'">{{ statusLabel(row.ZT) }}</template>
            <template v-else>{{ row[column.field as keyof HypertensionRecord] || '-' }}</template>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </section>
</template>
