// import process from 'process'

export const DEBUG: boolean = process.env.NODE_ENV !== 'production'

export const DEFAULT_DATETIME_ZONE: string = 'UTC'
export const DATE_FORMAT_STRING: string = 'dd.LL.yyyy'
export const STD_DATE_FORMAT_STRING: string = 'yyyy-LL-dd'
export const TIME_FORMAT_STRING: string = 'HH:mm'
export const DATETIME_FORMAT_STRING: string = 'dd.LL.yyyy HH:mm'
export const STD_DATETIME_FORMAT_STRING: string = 'yyyy-LL-dd HH:mm'
export const YEAR_FORMAT_STRING: string = 'yyyy'
export const HOUR_FORMAT_STRING: string = 'HH'

export const DEFAULT_COLUMN_WIDTH = 120

export const ROLE_ADMIN: string = 'ROLE_ADMIN'
export const ROLE_DESIGNER: string = 'ROLE_DESIGNER'
export const ROLE_USER: string = 'ROLE_USER'
