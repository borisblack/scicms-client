import axios from 'axios'
import {throwResponseError} from './index'

export interface TokenResponse {
    token: string
}

export interface UserInfo {
    user: {
        keyedName: string
        username: string
    },
    roles: Array<string>
}

export const login = (credentials: { username: string, password: string }) => {
    const { username, password } = credentials
    return axios.post('/login', null, {
        headers: {
            'X-Auth-Username': encodeURI(username),
            'X-Auth-Password': encodeURI(password)
        }
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

export const fetchUserInfo = (): Promise<UserInfo> => (
    axios.get('/user-info')
        .then(response => response.data)
        .catch(e => { throwResponseError(e) })
)
