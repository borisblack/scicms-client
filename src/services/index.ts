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
axios.defaults.baseURL = config.coreUrl
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const jwt = getJwt()
    if (jwt) {
        if (!config.headers)
            config.headers = {}

        config.headers['Authorization'] = `Bearer ${jwt}`
    }
    return config
})

export function extractAxiosErrorMessage(e: AxiosError): string {
    const res = e.response
    if (res) {
        if (res.status === 401 && getJwt())
            return 'User session expired'
        else
            return codeMessage[res.status] || e.message
    } else
        return e.message
}

export const throwAxiosResponseError = (e: AxiosError) => {
    throw new Error(extractAxiosErrorMessage(e))
}

// Setup ApolloClient
const uploadLink = createUploadLink({uri: `${config.coreUrl}/graphql`})

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
            errorPolicy: 'all',
        },
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
        },
    }
})

export const extractGraphQLErrorMessages = (errors: ReadonlyArray<GraphQLError>) => errors.map(err => err.message).join('; ')

export const throwGraphQLErrors = (errors: ReadonlyArray<GraphQLError>) => {
    throw new Error(extractGraphQLErrorMessages(errors))
}
