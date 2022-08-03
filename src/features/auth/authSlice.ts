import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {getExpireAt, getJwt, removeExpireAt, removeJwt, storeExpireAt, storeJwt} from '../../services'
import {DateTime} from 'luxon'
import AuthService from '../../services/auth'
import {JwtTokenResponse} from '../../services/auth'
import {RootState} from '../../store'
import {UserInfo} from '../../types'

export interface AuthState {
    loading: boolean
    jwt: string | null
    expireAt: number | null
    me: UserInfo | null
    error: Error | null
}

const authService = new AuthService()

const initialState: AuthState = {
    loading: false,
    jwt: getJwt(),
    expireAt: getExpireAt(),
    me: null,
    error: null
}

const login = createAsyncThunk(
    'auth/login',
    (credentials: {username: string, password: string}) => {
        removeJwt()
        return authService.login(credentials).then(tokenResponse => tokenResponse)
    }
)

const fetchMeIfNeeded = createAsyncThunk(
    'auth/fetchMeIfNeeded',
    () => authService.fetchMe().then(me => me),
    {
        condition: (credentials, {getState}) => shouldFetchMe(getState() as {auth: AuthState})
    }
)

const shouldFetchMe = (state: {auth: AuthState}) => {
    const {loading, me} = state.auth
    return !me && !loading
}

const logout = createAsyncThunk(
    'auth/logout',
    () => authService.logout()
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
        [login.fulfilled as any]: (state: AuthState, action: {payload: JwtTokenResponse}) => {
            const {jwt, expirationIntervalMillis, user} = action.payload
            const expireAt = DateTime.now().plus({millisecond: expirationIntervalMillis}).toMillis()
            storeJwt(jwt)
            storeExpireAt(expireAt)
            state.jwt = jwt
            state.expireAt = expireAt
            state.me = {
                username: user.username,
                roles: user.roles
            }
            state.loading = false
            state.error = null
        },
        [login.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.loading = false
        },
        [fetchMeIfNeeded.pending as any]: (state: AuthState) => {
            state.loading = true
            state.error = null
        },
        [fetchMeIfNeeded.fulfilled as any]: (state: AuthState, action: {payload: UserInfo}) => {
            const me = action.payload
            state.me = {
                username: me.username,
                roles: me.roles
            }
            state.loading = false
            state.error = null
        },
        [fetchMeIfNeeded.rejected as any]: (state: AuthState, action: {error: Error}) => {
            state.error = action.error
            state.me = null
            state.loading = false
        },
        [logout.pending as any]: (state: AuthState) => {
            state.loading = true
            state.error = null
        },
        [logout.fulfilled as any]: (state: AuthState) => {
            removeJwt()
            removeExpireAt()
            state.jwt = null
            state.expireAt = null
            state.me = null
            state.loading = false
            state.error = null
        },
        [logout.rejected as any]: (state: AuthState, action: {error: Error}) => {
            removeJwt()
            removeExpireAt()
            state.error = action.error
            state.jwt = null
            state.expireAt = null
            state.me = null
            state.loading = false
        }
    }
})

export {login, fetchMeIfNeeded, logout}

export const selectLoading = (state: RootState) => state.auth.loading

export const selectJwt = (state: RootState) => state.auth.jwt

export const selectIsExpired = (state: RootState) => !!state.auth.expireAt && state.auth.expireAt < DateTime.now().toMillis()

export const selectMe = (state: RootState) => state.auth.me

export const selectError = (state: RootState) => state.auth.error

export default authSlice.reducer