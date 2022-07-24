import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {apolloClient, getJwt, removeJwt, storeJwt} from '../../services'
import * as AuthService from '../../services/auth'
import {TokenResponse} from '../../services/auth'
import {gql} from '@apollo/client'

interface MeInfo {
    username: string,
    roles: Array<string>
}

export interface AuthState {
    loading: boolean
    jwt: string | null
    expirationIntervalMillis: number | null
    me: MeInfo | null
    error: Error | null
}

const initialState: AuthState = {
    loading: false,
    jwt: getJwt(),
    expirationIntervalMillis: null,
    me: null,
    error: null
}

const ME_QUERY = gql`
    query {
        me {
            username
            roles
        }
    }
`

const login = createAsyncThunk(
    'auth/login',
    (credentials: {username: string, password: string}) => {
        removeJwt()
        return AuthService.login(credentials).then(tokenResponse => tokenResponse)
    }
)

const fetchMeIfNeeded = createAsyncThunk(
    'auth/fetchMeIfNeeded',
    () => apolloClient.query({query: ME_QUERY}).then(result => result.data.me),
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
            const {jwt, expirationIntervalMillis, user} = action.payload
            storeJwt(jwt)
            state.jwt = jwt
            state.expirationIntervalMillis = expirationIntervalMillis
            // state.me = {
            //     username: user.username,
            //     roles: user.roles
            // }
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
        [fetchMeIfNeeded.fulfilled as any]: (state: AuthState, action: {payload: MeInfo}) => {
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
            state.jwt = null
            state.expirationIntervalMillis = null
            state.me = null
            state.loading = false
            state.error = null
        },
        [logout.rejected as any]: (state: AuthState, action: {error: Error}) => {
            removeJwt()
            state.error = action.error
            state.jwt = null
            state.expirationIntervalMillis = null
            state.me = null
            state.loading = false
        }
    }
})

export {login, fetchMeIfNeeded, logout}

export const selectLoading = (state: {auth: AuthState}) => state.auth.loading

export const selectJwt = (state: {auth: AuthState}) => state.auth.jwt

export const selectMe = (state: {auth: AuthState}) => state.auth.me

export const selectError = (state: {auth: AuthState}) => state.auth.error

export default authSlice.reducer