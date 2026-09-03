<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  icon: string
  label: string
  badge?: number
}>(), {
  badge: 0,
})
</script>

<template>
  <Button type="button" variant="ghost" size="icon-sm" class="header-icon-button" :aria-label="label" :title="label">
    <Icon :icon="icon" />
    <span v-if="badge > 0" class="header-icon-button__badge">{{ badge > 99 ? '99+' : badge }}</span>
  </Button>
</template>

<style scoped>
.header-icon-button { position: relative; color: rgb(255 255 255 / 86%); }
.header-icon-button:hover { color: white; background: rgb(255 255 255 / 12%); }
.header-icon-button__badge {
  position: absolute;
  top: 1px;
  right: 0;
  display: grid;
  min-width: 16px;
  height: 16px;
  place-items: center;
  padding: 0 4px;
  color: white;
  font-size: 9px;
  line-height: 1;
  background: var(--destructive);
  border: 2px solid var(--primary);
  border-radius: 999px;
}
</style>
