export interface GnRow { GNLY: string; GNMS: string }
export interface GnTableProps { modelValue?: GnRow[]; disabled?: boolean }
export interface GnTableEmits { (event: 'update:modelValue', value: GnRow[]): void }
