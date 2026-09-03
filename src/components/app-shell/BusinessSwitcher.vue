<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppShellApplication } from './types'

const props = defineProps<{
  applications: AppShellApplication[]
  activeCode: string
}>()

const emit = defineEmits<{
  select: [code: string]
}>()

const activeApplication = computed(() =>
  props.applications.find((item) => String(item.code) === props.activeCode),
)

const { width } = useWindowSize()
const visibleCount = computed(() => {
  if (width.value >= 1660) return 9
  if (width.value >= 1460) return 7
  if (width.value >= 1220) return 6
  return 4
})
const visibleApplications = computed(() => props.applications.slice(0, visibleCount.value))
const overflowApplications = computed(() => props.applications.slice(visibleCount.value))

function appIcon(name: string) {
  if (/档案/.test(name)) return 'solar:folder-with-files-linear'
  if (/疾病|慢病/.test(name)) return 'solar:heart-pulse-linear'
  if (/妇幼/.test(name)) return 'solar:users-group-two-rounded-linear'
  if (/三高/.test(name)) return 'solar:medical-kit-linear'
  if (/教育/.test(name)) return 'solar:square-academic-cap-linear'
  if (/统计/.test(name)) return 'solar:chart-2-linear'
  if (/登记/.test(name)) return 'solar:clipboard-text-linear'
  if (/质控/.test(name)) return 'solar:shield-check-linear'
  return 'solar:widget-5-linear'
}
</script>

<template>
  <nav class="business-switcher" aria-label="业务应用">
    <div class="business-switcher__desktop">
      <Button
        v-for="application in visibleApplications"
        :key="String(application.code)"
        type="button"
        size="sm"
        :variant="String(application.code) === activeCode ? 'secondary' : 'ghost'"
        :class="[
          'business-switcher__item',
          { 'business-switcher__item--active': String(application.code) === activeCode },
        ]"
        @click="emit('select', String(application.code))"
      >
        <Icon :icon="appIcon(application.name)" data-icon="inline-start" />
        <span>{{ application.name }}</span>
      </Button>
      <DropdownMenu v-if="overflowApplications.length">
        <DropdownMenuTrigger as-child>
          <Button type="button" size="sm" variant="ghost" class="business-switcher__item">
            <Icon icon="solar:menu-dots-bold" data-icon="inline-start" />
            <span>更多</span>
            <Icon icon="solar:alt-arrow-down-linear" data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          class="business-more-menu"
          :style="{
            width: '175px',
            minWidth: '175px',
            padding: '8px',
            backgroundColor: '#1890ff',
            border: '0',
            borderRadius: '8px',
          }"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              v-for="application in overflowApplications"
              :key="String(application.code)"
              class="business-more-menu__item"
              @select="emit('select', String(application.code))"
            >
              <Icon :icon="appIcon(application.name)" data-icon="inline-start" />
              <span class="truncate">{{ application.name }}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button type="button" variant="secondary" size="sm" class="business-switcher__mobile">
          <Icon icon="solar:widget-5-linear" data-icon="inline-start" />
          <span class="business-switcher__current">{{
            activeApplication?.name || '选择业务'
          }}</span>
          <Icon icon="solar:alt-arrow-down-linear" data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" class="w-64">
        <DropdownMenuLabel>切换业务应用</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            v-for="application in applications"
            :key="String(application.code)"
            @select="emit('select', String(application.code))"
          >
            <Icon :icon="appIcon(application.name)" />
            <span class="truncate">{{ application.name }}</span>
            <Icon
              v-if="String(application.code) === activeCode"
              icon="solar:check-circle-bold"
              class="business-switcher__check"
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </nav>
</template>

<style scoped>
.business-switcher {
  min-width: 0;
  flex: 1;
}
.business-switcher__desktop {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.business-switcher__desktop::-webkit-scrollbar {
  display: none;
}
.business-switcher__item {
  min-height: 36px;
  padding-inline: 12px;
  color: rgb(255 255 255 / 88%);
  font-size: 14px;
  border: 1px solid rgb(255 255 255 / 28%);
}
.business-switcher__item:hover {
  color: white;
  background: rgb(255 255 255 / 12%);
  border-color: rgb(255 255 255 / 42%);
}
.business-switcher__item--active,
.business-switcher__item--active:hover {
  color: var(--primary);
  background: white;
  border-color: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}
.business-switcher__mobile {
  display: none;
  max-width: min(52vw, 260px);
  color: var(--primary);
  background: white;
}
.business-switcher__current {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.business-switcher__check {
  margin-left: auto;
  color: var(--primary) !important;
}
.business-more-menu__item {
  min-height: 56px;
  gap: 10px;
  padding-inline: 10px;
  color: white;
  font-size: 14px;
  border-radius: 6px;
}
.business-more-menu__item:hover,
.business-more-menu__item:focus {
  color: white;
  background: rgb(255 255 255 / 14%);
}
.business-more-menu__item :deep(svg) {
  color: white !important;
}

@media (max-width: 900px) {
  .business-switcher {
    display: flex;
    justify-content: center;
  }
  .business-switcher__desktop {
    display: none;
  }
  .business-switcher__mobile {
    display: inline-flex;
  }
}
</style>
