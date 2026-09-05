export interface MenuItem {
  id: number | string
  pid?: number | string
  app?: string | number
  application?: string | number
  name?: string
  title?: string
  key?: string
  path?: string
  router?: string
  component?: string
  icon?: string
  sort?: number
  status?: number | string
  type?: number | string
  hidden?: boolean
  level?: number
  children?: MenuItem[]
}
