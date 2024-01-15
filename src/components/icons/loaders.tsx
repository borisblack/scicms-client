import * as antdIcons from '@ant-design/icons/lib/icons'
import * as faIcons from 'react-icons/fa'
import * as fa6Icons from 'react-icons/fa6'

const allFaIcons: Record<string, any>  = {...faIcons, ...fa6Icons}
const allIcons: Record<string, any> = {...antdIcons, ...allFaIcons}
export {antdIcons, allFaIcons, allIcons}

export const loadAntdIcons = () => import('@ant-design/icons/lib/icons')

const loadFaIcons = () => import('react-icons/fa')

const loadFa6Icons = () => import('react-icons/fa6')

export const loadAllFaIcons = () => Promise.all([
    loadFaIcons(),
    loadFa6Icons()
])
    .then(allFaIcons => {
        const [faIcons, fa6Icons] = allFaIcons
        return {...faIcons, ...fa6Icons}
    })

export const loadAllIcons = () => Promise.all([
    loadAntdIcons(),
    loadFaIcons(),
    loadFa6Icons()
])
    .then(allFaIcons => {
        const [antdIcons, faIcons, fa6Icons] = allFaIcons
        return {...antdIcons, ...faIcons, ...fa6Icons}
    })
