import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/locale/ru_RU'
// import {Settings as LuxonSettings} from 'luxon'
import 'dayjs/locale/ru'

import {LUXON_DATE_FORMAT_STRING, LUXON_DATETIME_FORMAT_STRING, LUXON_TIME_FORMAT_STRING} from './constants'
import {DashType, DeletingStrategy} from '../types'

// LuxonSettings.defaultZone = UTC
// dayjs.tz.setDefault(UTC)

interface AppConfig {
    coreUrl: string
    i18nLng: string
    antdLocale: Locale
    diagramTranslation: string
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
    }
    ui: {
        dataGrid: {
            colWidth: number
        }
        textArea: {
            rows: number
        }
    }
}

const appConfig: AppConfig = {
    coreUrl: 'http://localhost:8079',
    i18nLng: 'ru',
    antdLocale: ruRU,
    diagramTranslation: 'ru',
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
        openFirstDashboard: true
    },
    ui: {
        dataGrid: {
            colWidth: 140
        },
        textArea: {
            rows: 4
        }
    }
}

export default appConfig