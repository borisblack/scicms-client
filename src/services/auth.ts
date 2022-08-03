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
            username
            roles
        }
    }
`

export default class AuthService {
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

    fetchMe = (): Promise<UserInfo> => apolloClient.query({query: ME_QUERY}).then(result => result.data.me)
}

