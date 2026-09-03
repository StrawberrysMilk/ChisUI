export interface HypertensionRecord {
  Guid?: string
  DAH?: string
  XM?: string
  SFZH?: string
  XB?: string
  NL?: number | string
  JGMC?: string
  ZT?: number | string
  IState?: number | string
  SFTYGL?: number | string
  GXYDJRQ?: string
  LastSFRQ?: string
}

export interface HypertensionFilters {
  searchText: string
  searchType: string
  zt: string
  iState: string
  sftygl: string
}
