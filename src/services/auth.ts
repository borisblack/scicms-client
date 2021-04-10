import axios from 'axios'
import {throwResponseError} from './index'

export interface TokenResponse {
    token: string
}

export interface UserInfo {
    authorities: Array<string>,
    profile: {
        fioInitials: string
    }
}

const storeApiKey = (apiKey: string) => { localStorage.setItem('apiKey', apiKey) }

export const getApiKey = () => localStorage.getItem('apiKey')

const removeApiKey = () => { localStorage.removeItem('apiKey') }

const clearCredentials = () => { removeApiKey() }

class AuthService {
    url: string = '/auth'

    logIn = (credentials: { username: string, password: string }) => {
        const { username, password } = credentials
        removeApiKey()
        return axios.post('/login', null, {
            headers: {
                'X-Auth-Username': encodeURI(username),
                'X-Auth-Password': encodeURI(password)
            }
        })
            .then(response => response.data)
            .then((data: TokenResponse) => {
                storeApiKey(data.token)
                return data
            })
            .catch(e => { throwResponseError(e) })
    }

    fetchUserInfo = (): Promise<UserInfo> => (
        axios.get('/user-info')
            .then(response => response.data)
            .catch(e => { throwResponseError(e) })
    )

    logOut = () => (
        axios.get('/logout', {method: 'POST'})
            .then(response => {
                clearCredentials()
                return response.data
            })
            .catch(e => {
                clearCredentials()
                throwResponseError(e)
            })
    )
}

export default AuthService