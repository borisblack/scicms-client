import * as _faIcons from 'react-icons/fa'
import * as _faIcons6 from 'react-icons/fa6'
import * as antdIcons from '@ant-design/icons/lib/icons'

export const faIcons = {..._faIcons}

export const faIcons6 = {..._faIcons6}

export const allFaIcons = {...faIcons, ...faIcons6}

export const allIcons: {[name: string]: any} = {...antdIcons, ...allFaIcons}

export {antdIcons}
