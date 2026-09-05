<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

import type { HeaderIconButtonProps } from './type'

defineOptions({ name: 'HeaderIconButton' })

withDefaults(defineProps<HeaderIconButtonProps>(), {
  badge: 0,
})
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="header-icon-button"
    :aria-label="label"
    :title="label"
  >
    <Icon :icon="icon" />
    <span v-if="badge > 0" class="header-icon-button__badge">{{ badge > 99 ? '99+' : badge }}</span>
  </Button>
</template>

<style scoped lang="scss" src="./index.scss"></style>
