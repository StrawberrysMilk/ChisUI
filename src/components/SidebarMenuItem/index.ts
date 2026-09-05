import type { SidebarMenuItemResolvedProps } from './type'
import { computed, shallowRef, watch } from 'vue'
import type { AppMenuNode } from '../app-shell/type'

import type { SetupContext } from 'vue'

import type { SidebarMenuItemEmits } from './type'

export function useSidebarMenuItem(
  props: SidebarMenuItemResolvedProps,
  emit: SetupContext<SidebarMenuItemEmits>['emit'],
) {
  const open = shallowRef(false)

  const hasChildren = computed(() => props.node.children.length > 0)

  const isActive = computed(() => props.node.path === props.activePath)

  const containsActive = computed(() => {
    const find = (node: AppMenuNode): boolean =>
      node.path === props.activePath || node.children.some(find)
    return find(props.node)
  })

  watch(
    containsActive,
    (active) => {
      if (active) open.value = true
    },
    { immediate: true },
  )

  function activate() {
    if (hasChildren.value) {
      if (props.collapsed) emit('requestExpand')
      else open.value = !open.value
      return
    }
    emit('navigate', props.node)
  }

  return { open, hasChildren, isActive, containsActive, activate }
}
