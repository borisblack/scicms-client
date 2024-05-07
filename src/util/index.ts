import _ from 'lodash'
import {notification} from 'antd'

import appConfig from '../config'
import i18n from '../i18n'

export function tryParseJson(value: any): boolean {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const getBit = (num: number, i: number) => (num & (1 << i)) !== 0

export const setBit = (num: number, i: number) => num | (1 << i)

export const clearBit = (num: number, i: number) => {
  const mask = ~(1 << i)
  return num & mask
}

export const notifyErrorThrottled =
    _.throttle(
      (message: string, description: string) => {
        notification.error({message, description})
      },
      appConfig.ui.notificationDuration * 1000,
      {trailing: false}
    )

export function copyToClipboard(text: string, notify: boolean = true) {
  navigator.clipboard.writeText(text).then(() => {
    if (notify) {
      notification.info({
        message: i18n.t('Copied to clipboard') as string,
        description: text
      })
    }
  })
}

export const extractSessionData = () => JSON.parse(localStorage.getItem('sessionData') ?? '{}')
