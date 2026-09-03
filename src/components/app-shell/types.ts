import type { UserApplication } from '@/store/global'

export type AppShellApplication = UserApplication

export interface RawMenuItem {
  id?: string | number
  pid?: string | number
  name?: string
  path?: string
  icon?: string
  iconBase?: string
  hidden?: boolean
  show?: boolean
  meta?: {
    title?: string
    icon?: string
    target?: string
    show?: boolean
    [key: string]: unknown
  }
  children?: RawMenuItem[]
  [key: string]: unknown
}

export interface AppMenuNode {
  id: string
  parentId: string
  title: string
  path: string
  routeName: string
  icon: string
  target?: string
  children: AppMenuNode[]
}

export interface WorkspaceTab {
  path: string
  title: string
  routeName?: string
  closable: boolean
}
