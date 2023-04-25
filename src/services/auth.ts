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
            sessionData
        }
    }
`

export default class AuthService {
    private static instance: AuthService | null = null

    static getInstance() {
        if (!AuthService.instance)
            AuthService.instance = new AuthService()

        return AuthService.instance
    }

    async login(credentials: { username: string, password: string }) {
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

    async logout() {
        try {
            const res = await axios.post('/logout')

            return res.data
        } catch (e: any) {
            throwAxiosResponseError(e)
        }
    }

    fetchMe = (): Promise<UserInfo> => apolloClient.query({query: ME_QUERY})
        .then(result => result.data.me)

    updateSessionData = (sessionData: {[key: string]: any}): Promise<{[key: string]: any}> =>
        apolloClient.mutate({mutation: UPDATE_SESSION_DATA_MUTATION, variables: {sessionData}})
            .then(result => result.data.sessionData)
}

