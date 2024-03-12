import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {notification} from 'antd'

import {RootState} from '../../store'
import {getExpireAt, getJwt, removeExpireAt, removeJwt, storeExpireAt, storeJwt} from '../../services'
import {DateTime} from 'luxon'
import {
    fetchSecurityConfig as doFetchSecurityConfig,
    fetchMe as doFetchMe,
    JwtTokenResponse,
    login as doLogin,
    loginOauth2 as doLoginOauth2,
    logout as doLogout,
    updateSessionData as doUpdateSessionData
} from '../../services/auth'
import {SecurityConfig, UserInfo} from '../../types'
import i18n from '../../i18n'

export interface AuthState {
    loading: boolean
    securityConfig: SecurityConfig
    jwt: string | null
    expireAt: number | null
    me: UserInfo | null
}

const initialState: AuthState = {
    securityConfig: {oauth2Providers: []},
    loading: false,
    jwt: getJwt(),
    expireAt: getExpireAt(),
    me: null
}

const fetchSecurityConfig = createAsyncThunk(
    'auth/fetchSecurityConfig',
    () => doFetchSecurityConfig().then(securityConfig => securityConfig)
)

const login = createAsyncThunk(
    'auth/login',
    (credentials: {username: string, password: string}) => {
        removeJwt()
        return doLogin(credentials).then(tokenResponse => tokenResponse)
    }
)

const loginOauth2 = createAsyncThunk(
    'auth/loginOauth2',
    (credentials: {provider: string, code: string}) => {
        removeJwt()
        return doLoginOauth2(credentials).then(tokenResponse => tokenResponse)
    }
)

const fetchMeIfNeeded = createAsyncThunk(
    'auth/fetchMeIfNeeded',
    () => doFetchMe().then(me => me),
    {
        condition: (credentials, {getState}) => shouldFetchMe(getState() as {auth: AuthState})
    }
)

const shouldFetchMe = (state: {auth: AuthState}) => {
    const {loading, me} = state.auth
    return !me /*&& !loading*/
}

const logout = createAsyncThunk(
    'auth/logout',
    () => doLogout()
)

const updateSessionData = createAsyncThunk(
    'auth/updateSessionData',
    doUpdateSessionData
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchSecurityConfig.pending, state => {
                state.loading = true
            })
            .addCase(fetchSecurityConfig.fulfilled, (state, action: PayloadAction<SecurityConfig>) => {
                state.securityConfig = action.payload
                state.loading = false
            })
            .addCase(fetchSecurityConfig.rejected, (state, action) => {
                state.loading = false
                notification.error({
                    message: i18n.t('Error fetching security config') as string,
                    description: action.error.message
                })
            })
            .addCase(login.pending, state => {
                state.loading = true
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<JwtTokenResponse>) => {
                const {jwt, expirationIntervalMillis, user} = action.payload
                const expireAt = DateTime.now().plus({millisecond: expirationIntervalMillis}).toMillis()
                storeJwt(jwt)
                storeExpireAt(expireAt)
                state.jwt = jwt
                state.expireAt = expireAt
                state.me = user
                state.loading = false
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                notification.error({
                    message: i18n.t('Login error') as string,
                    description: action.error.message
                })
            })
            .addCase(loginOauth2.pending, state => {
                state.loading = true
            })
            .addCase(loginOauth2.fulfilled, (state, action: PayloadAction<JwtTokenResponse>) => {
                const {jwt, expirationIntervalMillis, user} = action.payload
                const expireAt = DateTime.now().plus({millisecond: expirationIntervalMillis}).toMillis()
                storeJwt(jwt)
                storeExpireAt(expireAt)
                state.jwt = jwt
                state.expireAt = expireAt
                state.me = user
                state.loading = false
            })
            .addCase(loginOauth2.rejected, (state, action) => {
                state.loading = false
                notification.error({
                    message: i18n.t('Login error') as string,
                    description: action.error.message
                })
            })
            .addCase(fetchMeIfNeeded.pending, state => {
                state.loading = true
            })
            .addCase(fetchMeIfNeeded.fulfilled, (state, action: PayloadAction<UserInfo>) => {
                state.me = action.payload
                state.loading = false
            })
            .addCase(fetchMeIfNeeded.rejected, (state, action) => {
                state.me = null
                state.loading = false
                notification.error({
                    message: i18n.t('Error fetching user info') as string,
                    description: action.error.message
                })
            })
            .addCase(logout.pending, state => {
                state.loading = true
            })
            .addCase(logout.fulfilled, state => {
                removeJwt()
                removeExpireAt()
                state.jwt = null
                state.expireAt = null
                state.me = null
                state.loading = false
            })
            .addCase(logout.rejected, (state, action) => {
                removeJwt()
                removeExpireAt()
                state.jwt = null
                state.expireAt = null
                state.me = null
                state.loading = false
                notification.error({
                    message: i18n.t('Logout error') as string,
                    description: action.error.message
                })
            })
            .addCase(updateSessionData.pending, state => {
                state.loading = true
            })
            .addCase(updateSessionData.fulfilled, (state, action: PayloadAction<{[key: string]: any}>) => {
                const {me} = state
                if (me != null) {
                    me.sessionData = action.payload
                }
                state.loading = false
            })
            .addCase(updateSessionData.rejected, (state, action) => {
                state.loading = false
                notification.error({
                    message: i18n.t('Session data update error') as string,
                    description: action.error.message
                })
            })
    }
})

export {fetchSecurityConfig, login, loginOauth2, fetchMeIfNeeded, logout, updateSessionData}

export const selectLoading = (state: RootState) => state.auth.loading

export const selectSecurityConfig = (state: RootState) => state.auth.securityConfig

export const selectJwt = (state: RootState) => state.auth.jwt

export const selectIsExpired = (state: RootState) => !!state.auth.expireAt && state.auth.expireAt < DateTime.now().toMillis()

export const selectMe = (state: RootState) => state.auth.me

export default authSlice.reducer