import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'
import {Item} from '../../types'

export interface IPage {
    key: string
    label: string
    item: Item
    viewType: ViewType
    id?: string
}

export enum ViewType {
    default = 'default',
    view = 'view',
    add = 'add',
    edit = 'edit'
}

interface PagesState {
    pages: {[key: string]: IPage}
    activeKey?: string
}

const initialState: PagesState = {
    pages: {}
}

function generateKey(type: string, viewType: string, id?: string) {
    let key = `${type}#${viewType}`
    if (id !== undefined)
        key += `#${id}`

    return key
}

const slice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        openPage: (state, action: PayloadAction<{label: string, item: Item, viewType: ViewType, id?: string}>) => {
            const {pages} = state
            const {label, item, viewType, id} = action.payload
            const key = generateKey(item.name, viewType, id)
            if (!pages.hasOwnProperty(key))
                pages[key] = {key, label, item, viewType, id}

            state.activeKey = key
        },
        closePage: (state, action: PayloadAction<string>) => {
            const key = action.payload
            const {pages} = state
            delete pages[key]

            // Set new active key
            const keys = Object.keys(pages)
            if (keys.length > 0)
                state.activeKey = keys[0]
            else
                state.activeKey = undefined
        },
        updateLabel: (state, action: PayloadAction<{label: string, item: Item, viewType: ViewType, id?: string}>) => {
            const {label, item, viewType, id} = action.payload
            const {pages} = state
            const key = generateKey(item.name, viewType, id)
            if (pages.hasOwnProperty(key))
                pages[key].label = label
        },
        setActiveKey: (state, action) => {
            const {pages} = state
            const key = action.payload
            if (pages.hasOwnProperty(key))
                state.activeKey = action.payload
        },
        reset: () => initialState
    },
    extraReducers: {}
})

export const selectPages = (state: RootState) => Object.values(state.pages.pages) as IPage[]
export const selectActiveKey = (state: RootState) => state.pages.activeKey

export const {openPage, closePage, updateLabel, setActiveKey, reset} = slice.actions

export default slice.reducer