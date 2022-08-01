import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/lib/locale-provider/ru_RU'
import {Settings as LuxonSettings} from 'luxon'
import {
    DATE_FORMAT_STRING,
    DATETIME_FORMAT_STRING, DEFAULT_COLUMN_WIDTH,
    DEFAULT_DATETIME_ZONE,
    DEFAULT_PAGE_SIZE,
    TIME_FORMAT_STRING
} from './constants'

interface AppConfig {
    backendUrl: string
    i18nLng: string
    antdLocale: Locale
    dateTime: {
        defaultZone: string
        dateFormatString: string
        timeFormatString: string
        dateTimeFormatString: string
    }
    query: {
        findAll: {
            useDisplayAttrName: boolean
            defaultPageSize: number
        }
    },
    ui: {
        dataGrid: {
            defaultColumnWidth: number
        }
    }
}

const appConfig: AppConfig = {
    backendUrl: 'http://localhost:8079',
    i18nLng: 'ru',
    antdLocale: ruRU,
    dateTime: {
        defaultZone: DEFAULT_DATETIME_ZONE,
        dateFormatString: DATE_FORMAT_STRING,
        timeFormatString: TIME_FORMAT_STRING,
        dateTimeFormatString: DATETIME_FORMAT_STRING
    },
    query: {
        findAll: {
            useDisplayAttrName: true,
            defaultPageSize: DEFAULT_PAGE_SIZE
        }
    },
    ui: {
        dataGrid: {
            defaultColumnWidth: DEFAULT_COLUMN_WIDTH
        }
    }
}

LuxonSettings.defaultZone = appConfig.dateTime.defaultZone

export default appConfig