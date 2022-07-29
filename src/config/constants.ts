// import process from 'process'

export const DEBUG: boolean = process.env.NODE_ENV !== 'production'
export const MOMENT_DATE_FORMAT_STRING: string = 'DD.MM.YYYY'
export const DATE_FORMAT_STRING: string = 'dd.LL.yyyy'
export const TIME_FORMAT_STRING: string = 'HH:mm'
export const DATETIME_FORMAT_STRING: string = 'dd.LL.yyyy HH:mm'
export const DEFAULT_COLUMN_WIDTH = 120

export const ROLE_ADMIN: string = 'ROLE_ADMIN'
export const ROLE_DESIGNER: string = 'ROLE_DESIGNER'
