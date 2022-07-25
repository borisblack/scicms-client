import axios from 'axios'
import {apolloClient, throwResponseError} from '.'
import {gql} from '@apollo/client'

interface UserInfo {
    id: string
    username: string,
    roles: Array<string>
}

export interface TokenResponse {
    jwt: string,
    user: UserInfo,
    expirationIntervalMillis: number
}

export interface MeInfo {
    username: string,
    roles: Array<string>
}

const ME_QUERY = gql`
    query {
        me {
            username
            roles
        }
    }
`

export const login = (credentials: { username: string, password: string }) => {
    const { username, password } = credentials
    return axios.post('/api/auth/local', {
        identifier: encodeURI(username),
        password: encodeURI(password)
    })
        .then(response => response.data)
        .then((data: TokenResponse) => data)
        .catch(e => { throwResponseError(e) })
}

export const logout = () => (
    axios.post('/logout')
        .then(response => response.data)
        .catch(e => { throwResponseError(e) })
)

export const fetchMe = (): Promise<MeInfo> => apolloClient.query({query: ME_QUERY}).then(result => result.data.me)
