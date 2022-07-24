import axios from 'axios'
import {throwResponseError} from './index'

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

