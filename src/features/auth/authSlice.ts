import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import AuthService, {TokenResponse, UserInfo} from '../../services/auth'

export interface AuthState {
    didInvalidate: boolean,
    isFetching: boolean,
    isLoggedIn: boolean,
    error?: Error,
    tokenResponse?: TokenResponse,
    userInfo?: UserInfo,
}

const initialState: AuthState = {
    didInvalidate: false,
    isFetching: false,
    isLoggedIn: false
}

const authService = new AuthService()

const logIn = createAsyncThunk(
    'auth/logIn',
    (credentials: {username: string, password: string}) => authService.logIn(credentials).then(tokenResponse => tokenResponse)
)

const fetchUserInfo = createAsyncThunk(
    'auth/fetchUserInfo',
    () => authService.fetchUserInfo().then(userInfo => userInfo)
)

const fetchUserInfoIfNeeded = createAsyncThunk(
    'auth/fetchUserInfoIfNeeded',
    () => authService.fetchUserInfo().then(userInfo => userInfo),
    {
        condition: (credentials, {getState, extra}) => shouldFetchUserInfo(getState() as {auth: AuthState})
    }
)

const shouldFetchUserInfo = (state: {auth: AuthState}) => {
    const {didInvalidate, isFetching, userInfo} = state.auth
    if (!userInfo)
        return !isFetching
    else if (isFetching)
        return false
    else
        return didInvalidate
}

const _requestUserInfo = (state: AuthState) => {
    state.isFetching = true
    state.error = undefined
}

const _receiveUserInfo = (state: AuthState, action: {payload: UserInfo}) => {
    state.userInfo = action.payload
    state.isFetching = false
}

const logOut = createAsyncThunk(
    'auth/logOut',
    () => authService.logOut()
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        invalidate: state => {
            state.didInvalidate = true
        }
    },
    extraReducers: {
        [logIn.pending as any]: (state: AuthState) => {
            state.isFetching = true
            state.error = undefined
        },
        [logIn.fulfilled as any]: (state: AuthState, action) => {
            state.tokenResponse = action.payload
            state.isFetching = false
            state.isLoggedIn = true
            state.error = undefined
        },
        [logIn.rejected as any]: (state: AuthState, action) => {
            state.error = action.error
            throw new Error(action.error.message)
        },
        [fetchUserInfo.pending as any]: _requestUserInfo,
        [fetchUserInfo.fulfilled as any]: _receiveUserInfo,
        [fetchUserInfoIfNeeded.pending as any]: _requestUserInfo,
        [fetchUserInfoIfNeeded.fulfilled as any]: _receiveUserInfo,
        [logOut.pending as any]: (state: AuthState) => {
            state.isFetching = true
            state.error = undefined
        },
        [logOut.fulfilled as any]: (state: AuthState) => {
            state.didInvalidate = false
            state.isFetching = false
            state.isLoggedIn = false
            state.error = undefined
            state.tokenResponse = undefined
            state.userInfo = undefined
        },
        [logOut.rejected as any]: (state: AuthState, action: {payload: Error}) => {
            state.error = action.payload
        }
    }
})

export const {invalidate} = authSlice.actions

export {logIn, fetchUserInfo, fetchUserInfoIfNeeded, logOut}

export const selectTokenResponse = (state: {auth: AuthState}) => state.auth.tokenResponse

export const selectUserInfo = (state: {auth: AuthState}) => state.auth.userInfo

export default authSlice.reducer