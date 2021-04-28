import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {apolloClient, getApiKey, removeApiKey, storeApiKey} from '../../services'
import * as AuthService from '../../services/auth'
import {TokenResponse} from '../../services/auth'
import {gql} from '@apollo/client'

interface UserInfo {
    user: {
        keyedName: string
        username: string
    },
    roles: Array<string>
}

export interface AuthState {
    loading: boolean
    apiKey: string | null
    userInfo: UserInfo | null
    error: Error | null
}

const initialState: AuthState = {
    loading: false,
    apiKey: getApiKey(),
    userInfo: null,
    error: null
}

const USER_INFO_QUERY = gql`
    query {
        userInfo {
            user {
                keyedName
                username
            }
            roles
        }
    }
`

const login = createAsyncThunk(
    'auth/login',
    (credentials: {username: string, password: string}) => {
        removeApiKey()
        return AuthService.login(credentials).then(tokenResponse => tokenResponse)
    }
)

const fetchUserInfoIfNeeded = createAsyncThunk(
    'auth/fetchUserInfoIfNeeded',
    () => apolloClient.query({query: USER_INFO_QUERY}).then(result => result.data.userInfo),
    {
        condition: (credentials, {getState}) => shouldFetchUserInfo(getState() as {auth: AuthState})
    }
)

const shouldFetchUserInfo = (state: {auth: AuthState}) => {
    const {loading, userInfo} = state.auth
    return !userInfo && !loading
}

const logout = createAsyncThunk(
    'auth/logout',
    () => AuthService.logout()
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: {
        [login.pending as any]: (state: AuthState) => {
            state.loading = true
            state.error = null
        },
        [login.fulfilled as any]: (state: AuthState, action: {payload: TokenResponse}) => {
            const {token} = action.payload
            storeApiKey(token)
            state.apiKey = token
            state.loading = false
            state.error = null
        },
        [login.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.loading = false
        },
        [fetchUserInfoIfNeeded.pending as any]: (state: AuthState) => {
            state.loading = true
            state.error = null
        },
        [fetchUserInfoIfNeeded.fulfilled as any]: (state: AuthState, action: {payload: UserInfo}) => {
            state.userInfo = action.payload
            state.loading = false
            state.error = null
        },
        [fetchUserInfoIfNeeded.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.userInfo = null
            state.loading = false
        },
        [logout.pending as any]: (state: AuthState) => {
            state.loading = true
            state.error = null
        },
        [logout.fulfilled as any]: (state: AuthState) => {
            removeApiKey()
            state.apiKey = null
            state.userInfo = null
            state.loading = false
            state.error = null
        },
        [logout.rejected as any]: (state: AuthState, action: {error: Error}) => {
            removeApiKey()
            state.error = action.error
            state.apiKey = null
            state.userInfo = null
            state.loading = false
        }
    }
})

export {login, fetchUserInfoIfNeeded, logout}

export const selectLoading = (state: {auth: AuthState}) => state.auth.loading

export const selectApiKey = (state: {auth: AuthState}) => state.auth.apiKey

export const selectUserInfo = (state: {auth: AuthState}) => state.auth.userInfo

export const selectError = (state: {auth: AuthState}) => state.auth.error

export default authSlice.reducer