import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/lib/locale-provider/ru_RU'
import {Settings as LuxonSettings} from 'luxon'
import 'moment/locale/ru'

import {
    DATE_FORMAT_STRING,
    DATETIME_FORMAT_STRING,
    DEFAULT_COLUMN_WIDTH,
    DEFAULT_DATETIME_ZONE,
    DEFAULT_PAGE_SIZE,
    MOMENT_DATE_FORMAT_STRING,
    MOMENT_DATETIME_FORMAT_STRING,
    MOMENT_TIME_FORMAT_STRING,
    TIME_FORMAT_STRING
} from './constants'
import {DeletingStrategy} from '../types'

interface AppConfig {
    coreUrl: string
    i18nLng: string
    antdLocale: Locale
    dateTime: {
        defaultZone: string
        dateFormatString: string
        timeFormatString: string
        dateTimeFormatString: string
        momentDateFormatString: string
        momentTimeFormatString: string
        momentDateTimeFormatString: string
    }
    query: {
        findAll: {
            defaultPageSize: number
        }
    }
    mutation: {
        defaultCopyCollectionRelations: boolean
        defaultDeletingStrategy: DeletingStrategy
    }
    ui: {
        dataGrid: {
            defaultColWidth: number
        }
    }
}

const appConfig: AppConfig = {
    coreUrl: 'http://localhost:8079',
    i18nLng: 'ru',
    antdLocale: ruRU,
    dateTime: {
        defaultZone: DEFAULT_DATETIME_ZONE,
        dateFormatString: DATE_FORMAT_STRING,
        timeFormatString: TIME_FORMAT_STRING,
        dateTimeFormatString: DATETIME_FORMAT_STRING,
        momentDateFormatString: MOMENT_DATE_FORMAT_STRING,
        momentTimeFormatString: MOMENT_TIME_FORMAT_STRING,
        momentDateTimeFormatString: MOMENT_DATETIME_FORMAT_STRING
    },
    query: {
        findAll: {
            defaultPageSize: DEFAULT_PAGE_SIZE
        }
    },
    mutation: {
        defaultCopyCollectionRelations: true,
        defaultDeletingStrategy: DeletingStrategy.CASCADE
    },
    ui: {
        dataGrid: {
            defaultColWidth: DEFAULT_COLUMN_WIDTH
        }
    }
}

LuxonSettings.defaultZone = appConfig.dateTime.defaultZone

export default appConfig