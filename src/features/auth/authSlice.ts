import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {getApiKey, removeApiKey, storeApiKey} from '../../services'
import * as AuthService from '../../services/auth'
import {TokenResponse} from '../../services/auth'

export interface AuthState {
    isFetching: boolean
    apiKey: string | null
    userInfo: AuthService.UserInfo | null
    error: Error | null
}

const initialState: AuthState = {
    isFetching: false,
    apiKey: getApiKey(),
    userInfo: null,
    error: null
}

const login = createAsyncThunk(
    'auth/login',
    (credentials: {username: string, password: string}) => {
        removeApiKey()
        return AuthService.login(credentials).then(tokenResponse => tokenResponse)
    }
)

const fetchUserInfoIfNeeded = createAsyncThunk(
    'auth/fetchUserInfoIfNeeded',
    () => AuthService.fetchUserInfo().then(userInfo => userInfo),
    {
        condition: (credentials, {getState}) => shouldFetchUserInfo(getState() as {auth: AuthState})
    }
)

const shouldFetchUserInfo = (state: {auth: AuthState}) => {
    const {isFetching, userInfo} = state.auth
    return !userInfo && !isFetching
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
            state.isFetching = true
            state.error = null
        },
        [login.fulfilled as any]: (state: AuthState, action: {payload: TokenResponse}) => {
            const {token} = action.payload
            storeApiKey(token)
            state.apiKey = token
            state.isFetching = false
            state.error = null
        },
        [login.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.isFetching = false
        },
        [fetchUserInfoIfNeeded.pending as any]: (state: AuthState) => {
            state.isFetching = true
            state.error = null
        },
        [fetchUserInfoIfNeeded.fulfilled as any]: (state: AuthState, action: {payload: AuthService.UserInfo}) => {
            state.userInfo = action.payload
            state.isFetching = false
            state.error = null
        },
        [fetchUserInfoIfNeeded.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.userInfo = null
            state.isFetching = false
        },
        [logout.pending as any]: (state: AuthState) => {
            state.isFetching = true
            state.error = null
        },
        [logout.fulfilled as any]: (state: AuthState) => {
            removeApiKey()
            state.apiKey = null
            state.userInfo = null
            state.isFetching = false
            state.error = null
        },
        [logout.rejected as any]: (state: AuthState, action: {error: Error}) => {
            removeApiKey()
            state.error = action.error
            state.apiKey = null
            state.userInfo = null
            state.isFetching = false
        }
    }
})

export {login, fetchUserInfoIfNeeded, logout}

export const selectIsFetching = (state: {auth: AuthState}) => state.auth.isFetching

export const selectApiKey = (state: {auth: AuthState}) => state.auth.apiKey

export const selectUserInfo = (state: {auth: AuthState}) => state.auth.userInfo

export const selectError = (state: {auth: AuthState}) => state.auth.error

export default authSlice.reducer