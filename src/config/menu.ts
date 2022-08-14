import i18n from '../i18n'
import {ROLE_ADMIN, ROLE_DESIGNER, ROLE_USER} from './constants'

interface MenuConfig {
    items: (SubMenu | MenuItem)[]
}

export interface SubMenu {
    key: string
    label: string
    icon?: string
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
        icon: 'CrownOutlined',
        roles: [ROLE_ADMIN],
        children: [{
            key: 'security',
            label: i18n.t("Security"),
            icon: 'LockOutlined',
            roles: [ROLE_ADMIN],
            children: [{
                itemName: 'group'
            }, {
                itemName: 'user'
            }, {
                itemName: 'permission'
            }]
        }, {
            itemName: 'item'
        }, {
            itemName: 'revisionPolicy'
        }, {
            itemName: 'sequence'
        }, {
            itemName: 'locale'
        }, {
            itemName: 'lifecycle'
        }, {
            itemName: 'media'
        }, {
            itemName: 'location'
        }]
    }, {
        key: 'design',
        label: i18n.t("Design"),
        icon: 'RocketOutlined',
        roles: [ROLE_ADMIN, ROLE_DESIGNER, ROLE_USER], // TODO: Delete ROLE_USER in production
        children: [{
            itemName: 'product'
        }, {
            itemName: 'part'
        }, {
            itemName: 'startSheet'
        }, {
            itemName: 'changeNotice'
        }]
    }]
}

export default menuConfig