import * as antdIcons from '@ant-design/icons/lib/icons'
import * as _faIcons from 'react-icons/fa'

export const faIcons = {..._faIcons}

export const allIcons: {[name: string]: any} = {...antdIcons, ...faIcons}

export {antdIcons}
