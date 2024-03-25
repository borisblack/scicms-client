import axios from 'axios'
import {gql} from '@apollo/client'
import {apolloClient, extractAxiosErrorMessage, throwAxiosResponseError} from '.'
import {SecurityConfig, UserInfo} from '../types'

export interface JwtTokenResponse {
    jwt: string
    user: UserInfo
    expirationIntervalMillis: number
}

interface ChangePasswordRequest {
    oldPassword: string
    newPassword: string
}

const ME_QUERY = gql`
    query {
        me {
            id
            username
            roles
            authType
            sessionData
        }
    }
`

const UPDATE_SESSION_DATA_MUTATION = gql`
    mutation updateSessionData($sessionData: JSON) {
        updateSessionData(sessionData: $sessionData) {
            data
        }
    }
`

export async function fetchSecurityConfig(): Promise<SecurityConfig> {
    try {
        const res = await axios.get('/api/config/security')

        return res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }
}

export async function login(credentials: { username: string, password: string }) {
    const { username, password } = credentials

    try {
        const res = await axios.post('/api/auth/local', {
            identifier: encodeURI(username),
            password: encodeURI(password)
        })

        return res.data
    } catch (e: any) {
        throwAxiosResponseError(e)
    }
}

export async function loginOauth2(credentials: { provider: string, code: string }) {
    const { provider, code } = credentials

    try {
        const res = await axios.post('/api/auth/oauth2', {
            provider: encodeURI(provider),
            code: encodeURI(code)
        })

        return res.data
    } catch (e: any) {
        throwAxiosResponseError(e)
    }
}

export async function logout() {
    try {
        const res = await axios.post('/logout')

        return res.data
    } catch (e: any) {
        throwAxiosResponseError(e)
    }
}

export async function changePassword(request: ChangePasswordRequest) {
    try {
        await axios.post('/api/auth/local/password', request)
    } catch (e: any) {
        throwAxiosResponseError(e)
    }
}

export const fetchMe = (): Promise<UserInfo> => apolloClient.query({query: ME_QUERY})
    .then(result => result.data.me)

export const updateSessionData = (sessionData: {[key: string]: any}): Promise<{[key: string]: any}> =>
    apolloClient.mutate({mutation: UPDATE_SESSION_DATA_MUTATION, variables: {sessionData}})
        .then(result => result.data.updateSessionData.data)
