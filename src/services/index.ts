import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import config from '../config'
import {getApiKey} from './auth'

// Setup Axios
axios.defaults.headers.common['X-Requested-Width'] = 'XMLHttpRequest'
axios.defaults.baseURL = config.backendUrl
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const token = getApiKey()
    if (token)
        config.headers['X-Auth-Token'] = token
    return config
})

export const throwResponseError = (e: AxiosError) => {
    let msg: string
    const res = e.response
    if (res) {
        if (res.status === 401) {
            if (getApiKey())
                msg = 'Сессия пользователя истекла. Обновите страницу'
            else
                msg = 'Неверно имя пользователя и/или пароль'
        } else if (res.status === 403) {
            msg = 'Истекло время ожидания ответа сервера'
        } else if (res.status === 504) {
            msg = 'Истекло время ожидания ответа сервера'
        } else if (res.data && res.data.message) {
            msg = res.data.message
        } else msg = 'Произошла ошибка'
    } else msg = e.message

    throw new Error(msg)
}