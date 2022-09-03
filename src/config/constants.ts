// import process from 'process'

export const DEBUG: boolean = process.env.NODE_ENV !== 'production'

export const UTC = 'UTC'
export const LUXON_DATE_FORMAT_STRING: string = 'dd.LL.yyyy'
export const LUXON_STD_DATE_FORMAT_STRING: string = 'yyyy-LL-dd'
export const LUXON_YEAR_MONTH_FORMAT_STRING: string = 'LL.yyyy'
export const LUXON_STD_YEAR_MONTH_FORMAT_STRING: string = 'yyyy-LL'
export const LUXON_YEAR_FORMAT_STRING: string = 'yyyy'
export const LUXON_TIME_FORMAT_STRING: string = 'HH:mm'
export const LUXON_HOURS_FORMAT_STRING: string = 'HH'
export const LUXON_DATETIME_FORMAT_STRING: string = 'dd.LL.yyyy HH:mm'
export const LUXON_STD_DATETIME_FORMAT_STRING: string = 'yyyy-LL-dd HH:mm'
export const LUXON_DATE_HOURS_FORMAT_STRING: string = 'dd.LL.yyyy HH'
export const LUXON_STD_DATE_HOURS_FORMAT_STRING: string = 'yyyy-LL-dd HH'
export const MOMENT_ISO_TIME_FORMAT_STRING: string = "HH:mm:ssZ"

export const ROLE_ADMIN: string = 'ROLE_ADMIN'
export const ROLE_DESIGNER: string = 'ROLE_DESIGNER'
export const ROLE_USER: string = 'ROLE_USER'

export const MAJOR_REV_ATTR_NAME = 'majorRev'
export const MINOR_REV_ATTR_NAME = 'minorRev'
export const LOCALE_ATTR_NAME = 'locale'
export const STATE_ATTR_NAME = 'state'
