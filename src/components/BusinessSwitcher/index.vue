<script setup lang="ts">
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

import type { BusinessSwitcherProps, BusinessSwitcherEmits } from './type'

import { useBusinessSwitcher } from './index'

defineOptions({ name: 'BusinessSwitcher' })

const props = defineProps<BusinessSwitcherProps>()

const emit = defineEmits<BusinessSwitcherEmits>()

const { activeApplication, width, visibleApplications, overflowApplications, appIcon } =
  useBusinessSwitcher(props)
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

<style scoped lang="scss" src="./index.scss"></style>
