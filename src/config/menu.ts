import i18n from '../i18n'
import {ROLE_ADMIN, ROLE_DESIGNER} from './constants'

interface MenuConfig {
    items: (SubMenu | MenuItem)[]
}

export interface SubMenu {
    key: string
    label: string
    roles?: string[]
    children: (SubMenu | MenuItem)[]
}

export interface MenuItem {
    itemName: string // must much item name at scicms-core
}

const menuConfig: MenuConfig = {
    items: [{
        key: 'administration',
        label: i18n.t("Administration"),
        roles: [ROLE_ADMIN],
        children: [{
            key: 'security',
            label: i18n.t("Security"),
            roles: [ROLE_ADMIN],
            children: [{
                itemName: 'group'
            }, {
                itemName: 'user'
            }]
        }, {
            itemName: 'item'
        }]
    }, {
        key: 'design',
        label: i18n.t("Design"),
        roles: [ROLE_ADMIN, ROLE_DESIGNER],
        children: [{
            itemName: 'part'
        }]
    }]
}

export default menuConfig