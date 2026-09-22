import {createContext} from "react"
import {MDIContext} from "./MDITabs"

export const ReactMDIContext = createContext<MDIContext<any> | null>(null)
