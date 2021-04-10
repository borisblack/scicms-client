import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

import config from '../config'
import ru from './ru'
import en from './en'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en,
            ru
        },
        lng: config.i18nLng,
        fallbackLng: config.i18nLng,
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: true
        }
    })

export default i18n