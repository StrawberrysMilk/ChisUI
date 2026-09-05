<script setup lang="ts">
import { useAppFormDialog } from './index'
import type { AppFormDialogProps } from './type'

const props = defineProps<AppFormDialogProps>()
const { add, edit, close } = useAppFormDialog(props)
defineExpose({ add, edit, close })
</script>

<template><span class="hidden" /></template>
