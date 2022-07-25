import {Locale} from 'antd/lib/locale-provider'
import ruRU from 'antd/lib/locale-provider/ru_RU'

interface AppConfig {
    backendUrl: string,
    i18nLng: string,
    antdLocale: Locale
}

const appConfig: AppConfig = {
    backendUrl: 'http://localhost:8079',
    i18nLng: 'ru',
    antdLocale: ruRU
}

export default appConfig