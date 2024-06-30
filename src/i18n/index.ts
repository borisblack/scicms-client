import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

import ru from './ru'
import en from './en'
import {clientConfig} from 'src/config'

const _codeMessage: any = {
  200: 'Server successfully returned the requested data',
  201: 'Data was successfully created or modified by server',
  202: 'Request queued in background',
  204: 'Data deleted successfully',
  400: 'Request error, data not changed by server',
  401: 'Invalid username and/or password',
  403: 'Access is denied',
  404: 'Server cannot find the requested resource',
  406: 'Requested format is not available',
  410: 'Requested resource has been deleted and is no longer available',
  422: 'Validation error occurred while creating an object',
  500: 'Internal server error',
  502: 'Gateway error',
  503: 'Service is unavailable. Server is not ready to process the request',
  504: 'Timed out waiting for server response'
}

const codeMessage: any = {}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': en,
      'ru-RU': ru
    },
    lng: clientConfig.i18nLng,
    fallbackLng: clientConfig.i18nLng,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  })
  .then(t => {
    for (const code in _codeMessage) {
      if (!_codeMessage.hasOwnProperty(code))
        continue

      codeMessage[code] = t(_codeMessage[code])
    }
  })

export {codeMessage}

export default i18n