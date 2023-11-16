import * as antdIcons from '@ant-design/icons/lib/icons'
import * as _faIcons from 'react-icons/fa'
import * as _faIcons6 from 'react-icons/fa6'

export const faIcons = {..._faIcons}

export const faIcons6 = {..._faIcons6}

export const allIcons: {[name: string]: any} = {...antdIcons, ...faIcons, ...faIcons6}

export {antdIcons}
