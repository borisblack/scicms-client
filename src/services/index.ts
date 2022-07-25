import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import config from '../config'
import {codeMessage} from '../i18n'
import {ApolloClient, ApolloLink, from, InMemoryCache} from '@apollo/client'
import {createUploadLink} from 'apollo-upload-client'

export const storeJwt = (jwt: string) => { localStorage.setItem('jwt', jwt) }

export const storeExpireAt = (expiredAt: number) => { localStorage.setItem('expireAt', expiredAt.toString()) }

export const getJwt = (): string | null => localStorage.getItem('jwt')

export const getExpireAt = (): number | null => {
    const iso = localStorage.getItem('expireAt')
    return iso ? Number(iso) : null
}

export const removeJwt = () => { localStorage.removeItem('jwt') }

export const removeExpireAt = () => { localStorage.removeItem('expireAt') }

// Setup Axios
axios.defaults.headers.common['X-Requested-Width'] = 'XMLHttpRequest'
axios.defaults.baseURL = config.backendUrl
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const jwt = getJwt()
    if (jwt)
        config.headers['Authorization'] = `Bearer ${jwt}`
    return config
})

export const throwResponseError = (e: AxiosError) => {
    let msg: string
    const res = e.response
    if (res) {
        if (res.status === 401 && getJwt())
            msg = 'User session expired'
        else msg = codeMessage[res.status] || e.message
    } else msg = e.message

    throw new Error(msg)
}

// Setup ApolloClient
// const httpLink = new HttpLink({ uri: `${config.backendUrl}/graphql` })
const uploadLink = createUploadLink({ uri: `${config.backendUrl}/graphql` })

const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext((context: Record<string, any>) => {
        const headers = {...context.headers}
        const jwt = getJwt()
        if (jwt)
            headers['Authorization'] = `Bearer ${jwt}`

        return { headers }
    })

    return forward(operation)
})

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache({
        addTypename: false
    }),
    link: from([authMiddleware/*, httpLink*/, uploadLink]),
})
