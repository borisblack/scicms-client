import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'
import {DefaultItemTemplate, Item} from '../../types'
import _ from 'lodash'

export interface IPage {
    key: string
    item: Item
    viewType: ViewType
    data?: ItemData
}

export interface ItemData extends DefaultItemTemplate {
    [name: string]: any
}

export enum ViewType {
    default = 'default',
    view = 'view'
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

export function getLabel(page: IPage) {
    const {item, viewType, data} = page
    switch (viewType) {
        case ViewType.view:
            if (!data)
                return `${item.displayName} *`

            let displayAttrValue: string = (data as ItemData)[item.displayAttrName || 'id']
            if (displayAttrValue === 'id')
                displayAttrValue = displayAttrValue.substring(0, 8)

            return displayAttrValue
        case ViewType.default:
        default:
            return _.upperFirst(item.pluralName)
    }
}

const slice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        openPage: (state, action: PayloadAction<{item: Item, viewType: ViewType, data?: ItemData}>) => {
            const {pages} = state
            const {item, viewType, data} = action.payload
            const key = generateKey(item.name, viewType, data?.id)
            if (!pages.hasOwnProperty(key))
                pages[key] = {key, item, viewType, data}

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

export const {openPage, closePage, setActiveKey, reset} = slice.actions

export default slice.reducer