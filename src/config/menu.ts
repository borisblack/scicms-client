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
        label: 'Administration',
        icon: 'CrownOutlined',
        roles: [ROLE_ADMIN],
        children: [{
            key: 'security',
            label: 'Security',
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
            key: 'storage',
            label: 'Storage',
            icon: 'DatabaseOutlined',
            roles: [ROLE_ADMIN],
            children: [{
                itemName: 'media'
            }, {
                itemName: 'location'
            }]
        }, {
            itemName: 'itemTemplate'
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
        }]
    }, {
        key: 'design',
        label: 'Design',
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