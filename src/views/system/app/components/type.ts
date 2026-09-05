import type { AppFormDialogMode } from './enum'

export interface AppFormDialogProps {
  onSubmit: (values: Record<string, any>, mode: AppFormDialogMode) => unknown | Promise<unknown>
}
