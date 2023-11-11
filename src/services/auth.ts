import axios from 'axios'
import {apolloClient, throwAxiosResponseError} from '.'
import {gql} from '@apollo/client'
import {UserInfo} from '../types'

export interface JwtTokenResponse {
    jwt: string,
    user: UserInfo,
    expirationIntervalMillis: number
}

const ME_QUERY = gql`
    query {
        me {
            id
            username
            roles
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

export async function logout() {
    try {
        const res = await axios.post('/logout')

        return res.data
    } catch (e: any) {
        throwAxiosResponseError(e)
    }
}

export const fetchMe = (): Promise<UserInfo> => apolloClient.query({query: ME_QUERY})
    .then(result => result.data.me)

export const updateSessionData = (sessionData: {[key: string]: any}): Promise<{[key: string]: any}> =>
    apolloClient.mutate({mutation: UPDATE_SESSION_DATA_MUTATION, variables: {sessionData}})
        .then(result => result.data.updateSessionData.data)
