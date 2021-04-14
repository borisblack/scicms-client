import _ from 'lodash'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {gql} from '@apollo/client'

import {apolloClient} from '../../services'

interface MenuItem {
    id: string
    name: string
    listOfMenuRelationship: MenuRelationship[]
    listOfClassMenu?: ClassMenu[]
}

export interface MenuRelationship {
    target_id: MenuItem
}

export interface ClassMenu {
    source_id: ClassItem
    target_id: MenuItem
}

interface ClassItem {
    id: string
    name: string
    label: string
    label_plural: string
}

interface NavigationState {
    loading: boolean,
    menus: MenuRelationship[],
}

const initialState: NavigationState = {
    loading: false,
    menus: []
}

const ROOT_MENU_QUERY = gql`
    query {
        queryItem(
            type: "Menu"
            action: "recursive"
            fields: [
                {name: "id"}
                {name: "name"}
                {name: "listOfMenuRelationship" fields: [
                    {name: "target_id" fields: [
                        {name: "id"}
                        {name: "name"}
                    ]}
                ]}
            ]
            matches: [{name: "name" condition: EQ value: "root"}]
            sort: "name"
        )
    }
`

const getClassesQuery = (menuIds: string[]) => gql`
    query {
        queryClass_Menu(
            action: "get"
            matches: [{
                name: "target_id" 
                condition: IN 
                value: [${menuIds.map(id => `"${id}"`).join(', ')}]
            }]
            sort: "source_id.label_plural"
        ) {
            source_id {
                id
                name
                label_plural
            }
            target_id {
                id
            }
        }
    }
`

const fetchListOfMenuRelationship = createAsyncThunk('navigation/fetchListOfMenuRelationship', async () => {
    const rootMenuItem = await fetchRootMenu()
    if (rootMenuItem === undefined)
        return []

    const menuMap = toMap(rootMenuItem)
    const listOfClassMenu = await fetchListOfClassMenu(Object.keys(menuMap))
    addListOfClassMenu(menuMap, listOfClassMenu)
    return rootMenuItem.listOfMenuRelationship || []
})

async function fetchRootMenu(): Promise<MenuItem> {
    const result = await apolloClient.query({query: ROOT_MENU_QUERY})
    const original = result.data.queryItem[0]
    return _.cloneDeep(original)
}

function toMap(rootMenu: MenuItem): {[id: string]: MenuItem} {
    const map: {[id: string]: MenuItem} = {}
    map[rootMenu.id] = rootMenu
    addMenusToMap(map, rootMenu.listOfMenuRelationship)
    return map
}

function addMenusToMap(map: {[id: string]: MenuItem}, listOfMenuRelationship: MenuRelationship[]) {
    if (!listOfMenuRelationship || listOfMenuRelationship.length === 0)
        return

    for (const menuRelationship of listOfMenuRelationship) {
        const target: MenuItem = menuRelationship.target_id
        map[target.id] = target
        addMenusToMap(map, target.listOfMenuRelationship) // call recursively
    }
}

async function fetchListOfClassMenu(menuIds: string[]): Promise<ClassMenu[]> {
    const result = await apolloClient.query({query: getClassesQuery(menuIds)})
    return result.data.queryClass_Menu
}

function addListOfClassMenu(map: {[id: string]: MenuItem}, listOfClassMenu: ClassMenu[]) {
    for (const classMenu of listOfClassMenu) {
        const menuId = classMenu.target_id.id
        const menu = map[menuId]

        if (menu.listOfClassMenu === undefined)
            menu.listOfClassMenu = []

        menu.listOfClassMenu.push(classMenu)
    }
}

const slice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        reset: state => {
            const {loading, menus} = initialState
            state.loading = loading
            state.menus = menus
        }
    },
    extraReducers: {
        [fetchListOfMenuRelationship.pending as any]: state => {
            state.loading = true
        },
        [fetchListOfMenuRelationship.fulfilled as any]: (state, action) => {
            state.menus = action.payload
            state.loading = false
        },
        [fetchListOfMenuRelationship.rejected as any]: (state, action) => {
            state.loading = false
            throw new Error(action.error.message)
        }
    }
})

export {fetchListOfMenuRelationship}

export const {reset} = slice.actions

export const selectLoading = (state: {navigation: NavigationState}) => state.navigation.loading

export const selectMenus = (state: {navigation: NavigationState}) => state.navigation.menus

export default slice.reducer
