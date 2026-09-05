import type { AppShellApplication } from '../app-shell/type'

export type BusinessSwitcherProps = {
  applications: AppShellApplication[]
  activeCode: string
}

export type BusinessSwitcherEmits = {
  select: [code: string]
}
