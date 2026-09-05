import type { WorkspaceTab } from '../app-shell/type'

export type WorkspaceTabsProps = { tabs: WorkspaceTab[]; activePath: string }

export type WorkspaceTabsEmits = {
  select: [path: string]
  close: [path: string]
  closeLeft: [path: string]
  closeRight: [path: string]
  closeAll: []
}
