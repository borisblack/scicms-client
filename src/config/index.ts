import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/lib/locale-provider/ru_RU'
// import {Settings as LuxonSettings} from 'luxon'
// import moment from 'moment-timezone'
import 'moment/locale/ru'

import {LUXON_DATE_FORMAT_STRING, LUXON_DATETIME_FORMAT_STRING, LUXON_TIME_FORMAT_STRING} from './constants'
import {DeletingStrategy} from '../types'

// LuxonSettings.defaultZone = UTC
// moment.tz.setDefault(UTC)

interface AppConfig {
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
    ui: {
        dataGrid: {
            colWidth: number
        }
    }
}

const appConfig: AppConfig = {
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
        maxPageSize: 50
    },
    mutation: {
        copyCollectionRelations: true,
        deletingStrategy: DeletingStrategy.CASCADE
    },
    ui: {
        dataGrid: {
            colWidth: 140
        }
    }
}

export default appConfig