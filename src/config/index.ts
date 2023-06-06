import dayjs from 'dayjs'
import {notification} from 'antd'
import {Locale} from 'antd/lib/locale'
import ruRU from 'antd/locale/ru_RU'
// import {Settings as LuxonSettings} from 'luxon'
import 'dayjs/locale/ru'

import {LUXON_DATE_FORMAT_STRING, LUXON_DATETIME_FORMAT_STRING, LUXON_TIME_FORMAT_STRING} from './constants'
import {DeletingStrategy} from '../types'

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

notification.config({
    placement: appConfig.ui.notificationPlacement,
    duration: appConfig.ui.notificationDuration
})

export default appConfig