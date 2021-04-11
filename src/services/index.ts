import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import config from '../config'

export const storeApiKey = (apiKey: string) => { localStorage.setItem('apiKey', apiKey) }

export const getApiKey = () => localStorage.getItem('apiKey')

export const removeApiKey = () => { localStorage.removeItem('apiKey') }

// Setup Axios
axios.defaults.headers.common['X-Requested-Width'] = 'XMLHttpRequest'
axios.defaults.baseURL = config.backendUrl
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const token = getApiKey()
    if (token)
        config.headers['X-Auth-Token'] = token
    return config
})

const codeMessage: any = {
    200: 'Сервер успешно вернул запрошенные данные',
    201: 'Данные успешно созданы или изменены сервером',
    202: 'Запрос помещен в очередь в фоновом режиме',
    204: 'Данные успешно удалены',
    400: 'Ошибка запроса, данные не изменены сервером',
    401: 'Неверно имя пользователя и/или пароль',
    403: 'Доступ запрещен',
    404: 'Сервер не может найти запрашиваемый ресурс',
    406: 'Запрошенный формат недоступен',
    410: 'Запрашиваемый ресурс удален и больше не доступен',
    422: 'При создании объекта произошла ошибка валидации',
    500: 'Внутренняя ошибка сервера',
    502: 'Ошибка шлюза',
    503: 'Сервис недоступен. Сервер не готов обрабатывать запрос',
    504: 'Истекло время ожидания ответа сервера',
}

export const throwResponseError = (e: AxiosError) => {
    let msg: string
    const res = e.response
    if (res) {
        if (res.status === 401 && getApiKey())
            msg = 'Сессия пользователя истекла'
        else msg = codeMessage[res.status] || e.message
    } else msg = e.message

    throw new Error(msg)
}