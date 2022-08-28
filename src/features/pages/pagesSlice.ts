import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'
import {Item, ItemData} from '../../types'

export interface IPage {
    key: string
    item: Item
    viewType: ViewType
    data?: ItemData
}

export enum ViewType {
    default = 'default',
    view = 'view'
}

interface PagesState {
    pages: {[key: string]: IPage}
    activeKey?: string
}

const tempIds: {[itemName: string]: number} = {}

function generateKey(itemName: string, viewType: ViewType, id?: string) {
    let key = `${itemName}#${viewType}`
    if (id !== undefined) {
        key += `#${id}`
    } else if (viewType === ViewType.view) {
        const tempId = (tempIds[itemName] ?? 0) + 1
        tempIds[itemName] = tempId
        key += `#${tempId}`
    }

    return key
}

export function getLabel(page: IPage) {
    const {key, item, viewType, data} = page
    switch (viewType) {
        case ViewType.view:
            if (data) {
                let displayAttrValue: string = (data as ItemData)[item.titleAttribute]
                if (displayAttrValue === 'id')
                    displayAttrValue = displayAttrValue.substring(0, 8)

                return displayAttrValue
            } else {
                return `${item.displayName} ${key.substring(key.lastIndexOf('#') + 1)} *`
            }
        case ViewType.default:
        default:
            return item.displayPluralName
    }
}

const initialState: PagesState = {
    pages: {}
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
                state.activeKey = keys[keys.length - 1]
            else
                state.activeKey = undefined
        },
        setActiveKey: (state, action: PayloadAction<string>) => {
            const {pages} = state
            const key = action.payload
            if (pages.hasOwnProperty(key))
                state.activeKey = action.payload
        },
        updateActivePage: (state, action: PayloadAction<ItemData>) => {
            const itemData = action.payload
            const {pages, activeKey} = state
            if (!activeKey)
                return

            const newPages: {[key: string]: IPage} = {}
            for (const key in pages) {
                if (!pages.hasOwnProperty(key))
                    continue

                const page = pages[key]
                if (page.key === activeKey) {
                    const newKey = generateKey(page.item.name, page.viewType, itemData.id)
                    newPages[newKey] = {
                        key: newKey,
                        item: page.item,
                        viewType: page.viewType,
                        data: itemData
                    }
                } else {
                    newPages[key] = page
                }
            }

            state.pages = newPages
        },
        reset: () => initialState
    },
    extraReducers: {}
})

export const selectPages = (state: RootState) => Object.values(state.pages.pages) as IPage[]
export const selectActiveKey = (state: RootState) => state.pages.activeKey

export const {openPage, closePage, setActiveKey, updateActivePage, reset} = slice.actions

export default slice.reducer