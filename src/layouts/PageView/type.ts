export interface PageViewMeta {
  title?: string
  description?: string
  linkList?: unknown[]
  extraImage?: string
  search?: boolean
  tabs?: Record<string, unknown>
}

export interface PageViewContent extends PageViewMeta {
  pageMeta?: PageViewMeta
}
