import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import config from '../config'
import {codeMessage} from '../i18n'
import {ApolloClient, ApolloLink, InMemoryCache, from, HttpLink} from '@apollo/client'

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

const httpLink = new HttpLink({ uri: `${config.backendUrl}/graphql` })

const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext((context: Record<string, any>) => {
        const headers = {...context.headers}
        const token = getApiKey()
        if (token)
            headers['X-Auth-Token'] = token

        return { headers }
    })

    return forward(operation)
})

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authMiddleware, httpLink]),
})
