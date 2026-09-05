<script setup lang="ts">
import type { GnTableProps, GnTableEmits } from './type'
import { useGnTable } from './index'
const props = withDefaults(defineProps<GnTableProps>(), { modelValue: () => [] })
const emit = defineEmits<GnTableEmits>()
const { data, update, remove, getTableData } = useGnTable(props, emit)
defineExpose({ getTableData, data })
</script>
<template>
  <div class="w-full overflow-hidden rounded-md border">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-muted/50 text-left">
        <tr>
          <th class="h-10 border-b px-3 font-medium">功能路由</th>
          <th class="h-10 border-b px-3 font-medium">功能描述</th>
          <th class="h-10 w-20 border-b px-3 font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="border-b last:border-b-0">
          <td class="p-2"><input class="h-8 w-full rounded border border-input bg-background px-2 text-sm" :value="row.GNLY" placeholder="功能路由" :disabled="disabled" @input="update(rowIndex, 'GNLY', ($event.target as HTMLInputElement).value)" /></td>
          <td class="p-2"><input class="h-8 w-full rounded border border-input bg-background px-2 text-sm" :value="row.GNMS" placeholder="功能描述" :disabled="disabled" @input="update(rowIndex, 'GNMS', ($event.target as HTMLInputElement).value)" /></td>
          <td class="p-2"><button v-if="row.GNLY.trim()" type="button" class="text-sm text-destructive hover:underline" :disabled="disabled" @click="remove(rowIndex)">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
