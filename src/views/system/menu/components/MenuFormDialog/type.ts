export interface MenuFormDialogProps {
  apps: any[]
  treeRows: any[]
  typeDict: any[]
  onSubmit: (values: Record<string, any>, mode: 'add' | 'edit') => unknown | Promise<unknown>
}
