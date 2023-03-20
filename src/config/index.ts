import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/locale/ru_RU'
// import {Settings as LuxonSettings} from 'luxon'
import 'dayjs/locale/ru'

import {LUXON_DATE_FORMAT_STRING, LUXON_DATETIME_FORMAT_STRING, LUXON_TIME_FORMAT_STRING} from './constants'
import {DashType, DeletingStrategy} from '../types'
import dayjs from 'dayjs'

// LuxonSettings.defaultZone = UTC
// dayjs.tz.setDefault(UTC)

interface AppConfig {
    coreVersion: string
    coreUrl: string
    i18nLng: string
    antdLocale: Locale
    dateTime: {
        timeZone: string
        luxonDisplayDateFormatString: string
        luxonDisplayTimeFormatString: string
        luxonDisplayDateTimeFormatString: string
        momentDisplayDateFormatString: string
        momentDisplayTimeFormatString: string
        momentDisplayDateTimeFormatString: string
    }
    query: {
        minPageSize: number
        defaultPageSize: number
        maxPageSize: number
    }
    mutation: {
        copyCollectionRelations: boolean
        deletingStrategy: DeletingStrategy
    }
    dashboard: {
        locale: string
        cols: number
        specRowHeight: number
        viewRowHeight: number
        minRefreshIntervalSeconds: number
        defaultRefreshIntervalSeconds: number
        defaultDashType: DashType
        defaultPageSize: number
        maxPageSize: number
        openFirstDashboard: boolean
        dash?: {
            all?: {
                color: string | string[]
                axisLabelStyle: {
                    [key: string]: any
                }
            },
            doughnut?: {
                labelStyle: {
                    [key: string]: any
                }
            },
            pie?: {
                labelStyle: {
                    [key: string]: any
                }
            },
            statistic?: {
                color?: string
            }
        }
    }
    ui: {
        dataGrid: {
            colWidth: number
        }
        form: {
            fieldWidth: number
            textAreaRows: number
        }
        notificationDuration: number,
        notificationPlacement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    }
}

const appConfig: AppConfig = {
    coreVersion: 'v1',
    coreUrl: 'http://localhost:8079',
    i18nLng: 'ru',
    antdLocale: ruRU,
    dateTime: {
        timeZone: 'Asia/Krasnoyarsk',
        luxonDisplayDateFormatString: LUXON_DATE_FORMAT_STRING,
        luxonDisplayTimeFormatString: LUXON_TIME_FORMAT_STRING,
        luxonDisplayDateTimeFormatString: LUXON_DATETIME_FORMAT_STRING,
        momentDisplayDateFormatString: 'DD.MM.YYYY',
        momentDisplayTimeFormatString: 'HH:mm',
        momentDisplayDateTimeFormatString: 'DD.MM.YYYY HH:mm'
    },
    query: {
        minPageSize: 5,
        defaultPageSize: 20,
        maxPageSize: 100
    },
    mutation: {
        copyCollectionRelations: true,
        deletingStrategy: DeletingStrategy.CASCADE
    },
    dashboard: {
        locale: 'ru-RU',
        cols: 24,
        specRowHeight: 100,
        viewRowHeight: 300,
        minRefreshIntervalSeconds: 5,
        defaultRefreshIntervalSeconds: 300,
        defaultDashType: DashType.bar,
        defaultPageSize: 100,
        maxPageSize: 1000,
        openFirstDashboard: true,
        dash: {
            doughnut: {
                labelStyle: {
                    textAlign: 'center',
                    fontSize: 14
                }
            },
            pie: {
                labelStyle: {
                    textAlign: 'center',
                    fontSize: 14
                }
            },
            statistic: {
                color: '#333366'
            },
        }
    },
    ui: {
        dataGrid: {
            colWidth: 140
        },
        form: {
            fieldWidth: 6,
            textAreaRows: 4
        },
        notificationDuration: 10,
        notificationPlacement: 'topRight'
    }
}

dayjs.locale(appConfig.i18nLng)

export default appConfig