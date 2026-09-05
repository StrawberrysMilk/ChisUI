<script setup lang="ts">
import type { MenuFormDialogProps } from './type'
import { useMenuFormDialog } from './index'

const props = defineProps<MenuFormDialogProps>()
const { add, edit, close } = useMenuFormDialog(props)
defineExpose({ add, edit, close })
</script>

<template><span class="hidden" /></template>
