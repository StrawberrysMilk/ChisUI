import type { AppShellApplication } from '../app-shell/type'

export type AppHeaderProps = {
  systemName: string
  applications: AppShellApplication[]
  activeCode: string
  collapsed: boolean
}

export type AppHeaderEmits = {
  selectApplication: [code: string]
  toggleSidebar: []
  openMobileMenu: []
}
