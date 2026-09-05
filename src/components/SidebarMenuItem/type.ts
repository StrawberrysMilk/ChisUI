import type { AppMenuNode } from '../app-shell/type'

export type SidebarMenuItemProps = {
  node: AppMenuNode
  activePath: string
  collapsed?: boolean
  depth?: number
}

export type SidebarMenuItemEmits = {
  navigate: [node: AppMenuNode]
  requestExpand: []
}

export type SidebarMenuItemResolvedProps = Readonly<SidebarMenuItemProps> &
  Required<Pick<SidebarMenuItemProps, 'collapsed' | 'depth'>>
