import {createContext} from 'react'
import {MDIContext} from '.'

export const ReactMDIContext = createContext<MDIContext<any> | null>(null)
