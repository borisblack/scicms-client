import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import config from '../config'
import {codeMessage} from '../i18n'
import {ApolloClient, ApolloLink, from, InMemoryCache} from '@apollo/client'
import {createUploadLink} from 'apollo-upload-client'
import {GraphQLError} from 'graphql/error'

export const storeJwt = (jwt: string) => { localStorage.setItem('jwt', jwt) }

export const storeExpireAt = (expiredAt: number) => { localStorage.setItem('expireAt', expiredAt.toString()) }

export const getJwt = (): string | null => localStorage.getItem('jwt')

export const getExpireAt = (): number | null => {
    const expireAt = localStorage.getItem('expireAt')
    return expireAt ? Number(expireAt) : null
}

export const removeJwt = () => { localStorage.removeItem('jwt') }

export const removeExpireAt = () => { localStorage.removeItem('expireAt') }

// Setup Axios
axios.defaults.headers.common['X-Requested-Width'] = 'XMLHttpRequest'
axios.defaults.baseURL = config.backendUrl
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const jwt = getJwt()
    if (jwt) {
        if (!config.headers)
            config.headers = {}

        config.headers['Authorization'] = `Bearer ${jwt}`
    }
    return config
})

export const throwAxiosResponseError = (e: AxiosError) => {
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
    link: from([authMiddleware/*, httpLink*/, uploadLink]),
    cache: new InMemoryCache({
        addTypename: false
    }),
    defaultOptions: {
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
        },
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
        }
    }
})

export const throwGraphQLErrors = (errors: ReadonlyArray<GraphQLError>) => {
    throw new Error(errors.map(err => err.message).join('; '))
}
