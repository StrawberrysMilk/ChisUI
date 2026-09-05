import { ref, watch } from 'vue'
import type { GnRow, GnTableProps, GnTableEmits } from './type'
export function useGnTable(props: Readonly<GnTableProps>, emit: GnTableEmits) {
  const data = ref<GnRow[]>(props.modelValue?.length ? [...props.modelValue] : [{ GNLY: '', GNMS: '' }])
  // The parent emits a new array for each edit. Reference watching is enough;
  // deep watching re-clones the table after every keystroke and makes vxe-table
  // rebuild its rows unnecessarily.
  watch(() => props.modelValue, (value) => {
    if (!value || value === data.value) return
    const next = value.length ? value : [{ GNLY: '', GNMS: '' }]
    if (
      next.length === data.value.length &&
      next.every((row, index) => row.GNLY === data.value[index]?.GNLY && row.GNMS === data.value[index]?.GNMS)
    ) return
    data.value = next.map((row) => ({ GNLY: row.GNLY ?? '', GNMS: row.GNMS ?? '' }))
  })
  function update(index: number, key: keyof GnRow, value: string) {
    data.value[index][key] = value
    if (key === 'GNLY' && value.trim() && index === data.value.length - 1) data.value.push({ GNLY: '', GNMS: '' })
    emit('update:modelValue', [...data.value])
  }
  function remove(index: number) { data.value.splice(index, 1); if (!data.value.length) data.value.push({ GNLY: '', GNMS: '' }); emit('update:modelValue', [...data.value]) }
  function getTableData() { return data.value.filter((row) => row.GNLY.trim() && row.GNMS.trim()) }
  return { data, update, remove, getTableData }
}
