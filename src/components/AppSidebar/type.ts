import type { AppMenuNode, AppShellApplication } from '../app-shell/type'

export type AppSidebarProps = {
  menus: AppMenuNode[]
  activePath: string
  collapsed: boolean
  mobileOpen: boolean
  activeApplication?: AppShellApplication
}

export type AppSidebarEmits = {
  navigate: [node: AppMenuNode]
  toggleCollapsed: []
  closeMobile: []
  requestExpand: []
}
