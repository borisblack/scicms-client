import _ from 'lodash'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'
import {Item, ItemData} from '../../types'
import i18n from '../../i18n'
import Mediator, {CallbackOperation} from '../../services/mediator'
import {EMPTY_ARRAY, ID_ATTR_NAME} from '../../config/constants'
import {objectToHash} from '../../util'

export interface IPage {
    key: string
    item: Item
    viewType: ViewType
    data?: ItemData | null
    extra?: Record<string, any>
}

export enum ViewType {
    default = 'default',
    view = 'view'
}

interface PagesState {
    pages: {[key: string]: IPage}
    activeKey?: string
}

interface OpenPagePayload {
    key?: string
    item: Item
    viewType: ViewType
    data?: ItemData | null
    extra?: Record<string, any>
}

interface UpdatePagePayload {
    key: string,
    data: ItemData,
    extra?: Record<string, any>
}

const tempIds: {[itemName: string]: number} = {}
const mediator = Mediator.getInstance()

export function generateKey(itemName: string, viewType: ViewType, id?: string, suffix?: string) {
    let key = `${itemName}#${viewType}`
    if (id != null) {
        key += `#${id}`
    } else if (viewType === ViewType.view) {
        const tempId = (tempIds[itemName] ?? 0) + 1
        tempIds[itemName] = tempId
        key += `#${tempId}`
    }

    return suffix == null ? key : `${key}#${suffix}`
}

export function getLabel(page: IPage) {
    const {key, item, viewType, data} = page
    switch (viewType) {
        case ViewType.view:
            if (data?.id) {
                let titleAttrValue = data[item.titleAttribute]
                if (!titleAttrValue || item.titleAttribute === ID_ATTR_NAME)
                    titleAttrValue = `${i18n.t(item.displayName)} ${data.id.substring(0, 8)}`

                return titleAttrValue
            }
            return `${i18n.t(item.displayName)} ${key.substring(key.lastIndexOf('#') + 1)} *`
        case ViewType.default:
        default:
            return i18n.t(item.displayPluralName)
    }
}

const initialState: PagesState = {
    pages: {}
}

const slice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setActiveKey: (state, action: PayloadAction<string>) => {
            const {pages} = state
            const key = action.payload
            if (pages.hasOwnProperty(key))
                state.activeKey = action.payload
        },
        openPage: (state, action: PayloadAction<OpenPagePayload>) => {
            const {pages} = state
            const {key, item, viewType, data, extra} = action.payload
            const suffix = extra == null ? undefined : objectToHash(extra).toString()
            const k = key ?? generateKey(item.name, viewType, data?.id, suffix)
            if (!pages.hasOwnProperty(k))
                pages[k] = {key: k, item, viewType, data, extra}

            state.activeKey = k
        },
        updatePage: (state, action: PayloadAction<UpdatePagePayload>) => {
            const {key, data, extra} = action.payload
            const {pages, activeKey} = state

            const newPages: {[key: string]: IPage} = {}
            for (const k in pages) {
                if (!pages.hasOwnProperty(k))
                    continue

                const page = pages[k]
                if (page.key === key) {
                    const suffix = extra == null ? undefined : objectToHash(extra).toString()
                    const newKey = generateKey(page.item.name, page.viewType, data.id, suffix)
                    newPages[newKey] = {
                        key: newKey,
                        item: page.item,
                        viewType: page.viewType,
                        data,
                        extra
                    }

                    if (page.key === activeKey)
                        state.activeKey = newKey

                    mediator.changeKey(key, newKey)
                    mediator.runObservableCallbacks(newKey, CallbackOperation.UPDATE, data.id)
                } else {
                    newPages[k] = page
                }
            }

            state.pages = newPages
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
                    const suffix = page.extra == null ? undefined : objectToHash(page.extra).toString()
                    const newKey = generateKey(page.item.name, page.viewType, itemData.id, suffix)
                    newPages[newKey] = {
                        key: newKey,
                        item: page.item,
                        viewType: page.viewType,
                        data: itemData,
                        extra: page.extra
                    }
                    state.activeKey = newKey

                    // Call here because key is changed
                    mediator.changeKey(activeKey, newKey)
                    mediator.runObservableCallbacks(newKey, CallbackOperation.UPDATE, itemData.id)
                } else {
                    newPages[key] = page
                }
            }

            state.pages = newPages
        },
        closePage: (state, action: PayloadAction<string>) => {
            const key = action.payload
            const {pages} = state
            delete pages[key]

            // Set new active key
            const keys = Object.keys(pages)
            if (keys.length === 0) {
                state.activeKey = undefined
            } else {
                if (key === state.activeKey)
                    state.activeKey = keys[keys.length - 1]
            }
        },
        closeActivePage: (state) => {
            const {activeKey, pages} = state
            if (!activeKey)
                return

            delete pages[activeKey]

            // Set new active key
            const keys = Object.keys(pages)
            if (keys.length > 0)
                state.activeKey = keys[keys.length - 1]
            else
                state.activeKey = undefined
        },
        reset: () => initialState
    }
})

export const selectPages = (state: RootState) => _.isEmpty(state.pages.pages) ? EMPTY_ARRAY : Object.values(state.pages.pages) as IPage[]
export const selectActiveKey = (state: RootState) => state.pages.activeKey

export const {setActiveKey, openPage, closePage, closeActivePage, updatePage, updateActivePage, reset} = slice.actions

export default slice.reducer