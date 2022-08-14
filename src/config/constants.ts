// import process from 'process'

export const DEBUG: boolean = process.env.NODE_ENV !== 'production'

export const DEFAULT_DATETIME_ZONE: string = 'UTC'
export const DATE_FORMAT_STRING: string = 'dd.LL.yyyy'
export const STD_DATE_FORMAT_STRING: string = 'yyyy-LL-dd'
export const YEAR_MONTH_FORMAT_STRING: string = 'LL.yyyy'
export const STD_YEAR_MONTH_FORMAT_STRING: string = 'yyyy-LL'
export const YEAR_FORMAT_STRING: string = 'yyyy'
export const TIME_FORMAT_STRING: string = 'HH:mm'
export const HOURS_FORMAT_STRING: string = 'HH'
export const DATETIME_FORMAT_STRING: string = 'dd.LL.yyyy HH:mm'
export const STD_DATETIME_FORMAT_STRING: string = 'yyyy-LL-dd HH:mm'
export const DATE_HOURS_FORMAT_STRING: string = 'dd.LL.yyyy HH'
export const STD_DATE_HOURS_FORMAT_STRING: string = 'yyyy-LL-dd HH'
export const MOMENT_DATE_FORMAT_STRING: string = 'DD.MM.YYYY'
export const MOMENT_DATETIME_FORMAT_STRING: string = 'DD.MM.YYYY HH:mm:ss'
export const MOMENT_TIME_FORMAT_STRING: string = 'HH:mm:ss'

export const DEFAULT_COLUMN_WIDTH = 130
export const DEFAULT_PAGE_SIZE = 20

export const ROLE_ADMIN: string = 'ROLE_ADMIN'
export const ROLE_DESIGNER: string = 'ROLE_DESIGNER'
export const ROLE_USER: string = 'ROLE_USER'
