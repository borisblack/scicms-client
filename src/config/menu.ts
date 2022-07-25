import i18n from '../i18n'

interface MenuConfig {
    categories: Category[]
    items: Item[]
}

interface Category {
    name: string
    displayName: string
    categories: Set<string | null>
}

interface Item {
    name: string
    categories: Set<string | null>
}

const menuConfig: MenuConfig = {
    categories: [{
        name: 'administration',
        displayName: i18n.t("Administration"),
        categories: new Set([null])
    }, {
        name: 'security',
        displayName: i18n.t("Security"),
        categories: new Set(['administration'])
    }, {
        name: 'design',
        displayName: i18n.t("Design"),
        categories: new Set([null])
    }],
    items: [{
        name: 'item',
        categories: new Set(['administration'])
    }, {
        name: 'group',
        categories: new Set(['security'])
    }, {
        name: 'user',
        categories: new Set(['security'])
    }, {
        name: 'part',
        categories: new Set(['design'])
    }]
}

export default menuConfig