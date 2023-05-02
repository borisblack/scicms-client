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

export function extract(src: Record<string, any>, path: string[]): any {
    let n = path.length
    if (n === 0)
        throw new Error('Illegal path argument')

    return path.reduce((prev, key, i) => prev[key] ?? (i < n-1 ? {} : undefined), src)
}

export const notifyErrorThrottled =
    _.throttle(
        (message: string, description: string) => notification.error({message, description}),
        appConfig.ui.notificationDuration * 1000,
        {trailing: false}
    )

export function assign(src: Record<string, any>, path: string[], value: any) {
    let n = path.length
    if (n === 0)
        throw new Error('Illegal path argument')

    path.reduce((prev, key, i) => {
        prev[key] = i < n-1 ? (prev[key] ?? {}) : value
        return prev[key]
    }, src)
}

export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        notification.info({message: i18n.t('Copied to clipboard') as string, description: text})
    })
}
