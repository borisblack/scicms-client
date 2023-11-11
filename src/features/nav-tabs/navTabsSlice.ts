import _ from 'lodash'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'
import {Item, ItemData} from '../../types'
import i18n from '../../i18n'
import Mediator, {CallbackOperation} from '../../services/mediator'
import {EMPTY_ARRAY, ID_ATTR_NAME} from '../../config/constants'
import {objectToHash} from '../../util'

export interface INavTab {
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

interface NavTabsState {
    navTabs: {[key: string]: INavTab}
    activeKey?: string
}

interface OpenNavTabPayload {
    key?: string
    item: Item
    viewType: ViewType
    data?: ItemData | null
    extra?: Record<string, any>
}

interface UpdateNavTabPayload {
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

export function getLabel(page: INavTab) {
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

const initialState: NavTabsState = {
    navTabs: {}
}

const slice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setActiveKey: (state, action: PayloadAction<string>) => {
            const {navTabs} = state
            const key = action.payload
            if (navTabs.hasOwnProperty(key))
                state.activeKey = action.payload
        },
        openNavTab: (state, action: PayloadAction<OpenNavTabPayload>) => {
            const {navTabs} = state
            const {key, item, viewType, data, extra} = action.payload
            const suffix = extra == null ? undefined : objectToHash(extra).toString()
            const k = key ?? generateKey(item.name, viewType, data?.id, suffix)
            if (!navTabs.hasOwnProperty(k))
                navTabs[k] = {key: k, item, viewType, data, extra}

            state.activeKey = k
        },
        updateNavTab: (state, action: PayloadAction<UpdateNavTabPayload>) => {
            const {key, data, extra} = action.payload
            const {navTabs, activeKey} = state

            const newNavTabs: {[key: string]: INavTab} = {}
            for (const k in navTabs) {
                if (!navTabs.hasOwnProperty(k))
                    continue

                const navTab = navTabs[k]
                if (navTab.key === key) {
                    const suffix = extra == null ? undefined : objectToHash(extra).toString()
                    const newKey = generateKey(navTab.item.name, navTab.viewType, data.id, suffix)
                    newNavTabs[newKey] = {
                        key: newKey,
                        item: navTab.item,
                        viewType: navTab.viewType,
                        data,
                        extra
                    }

                    if (navTab.key === activeKey)
                        state.activeKey = newKey

                    mediator.changeKey(key, newKey)
                    mediator.runObservableCallbacks(newKey, CallbackOperation.UPDATE, data.id)
                } else {
                    newNavTabs[k] = navTab
                }
            }

            state.navTabs = newNavTabs
        },
        updateActiveNavTab: (state, action: PayloadAction<ItemData>) => {
            const itemData = action.payload
            const {navTabs, activeKey} = state
            if (!activeKey)
                return

            const newNavTabs: {[key: string]: INavTab} = {}
            for (const key in navTabs) {
                if (!navTabs.hasOwnProperty(key))
                    continue

                const navTab = navTabs[key]
                if (navTab.key === activeKey) {
                    const suffix = navTab.extra == null ? undefined : objectToHash(navTab.extra).toString()
                    const newKey = generateKey(navTab.item.name, navTab.viewType, itemData.id, suffix)
                    newNavTabs[newKey] = {
                        key: newKey,
                        item: navTab.item,
                        viewType: navTab.viewType,
                        data: itemData,
                        extra: navTab.extra
                    }
                    state.activeKey = newKey

                    // Call here because key is changed
                    mediator.changeKey(activeKey, newKey)
                    mediator.runObservableCallbacks(newKey, CallbackOperation.UPDATE, itemData.id)
                } else {
                    newNavTabs[key] = navTab
                }
            }

            state.navTabs = newNavTabs
        },
        closeNavTab: (state, action: PayloadAction<string>) => {
            const key = action.payload
            const {navTabs} = state
            delete navTabs[key]

            // Set new active key
            const keys = Object.keys(navTabs)
            if (keys.length === 0) {
                state.activeKey = undefined
            } else {
                if (key === state.activeKey)
                    state.activeKey = keys[keys.length - 1]
            }
        },
        closeActiveNavTab: (state) => {
            const {activeKey, navTabs} = state
            if (!activeKey)
                return

            delete navTabs[activeKey]

            // Set new active key
            const keys = Object.keys(navTabs)
            if (keys.length > 0)
                state.activeKey = keys[keys.length - 1]
            else
                state.activeKey = undefined
        },
        reset: () => initialState
    }
})

export const selectNavTabs = (state: RootState) => _.isEmpty(state.navTabs.navTabs) ? EMPTY_ARRAY : Object.values(state.navTabs.navTabs) as INavTab[]
export const selectActiveKey = (state: RootState) => state.navTabs.activeKey

export const {setActiveKey, openNavTab, closeNavTab, closeActiveNavTab, updateNavTab, updateActiveNavTab, reset} = slice.actions

export default slice.reducer