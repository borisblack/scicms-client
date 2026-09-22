import {createContext} from "react"
import type {MDIContext} from "./MDITabs"

export const ReactMDIContext = createContext<MDIContext<any> | null>(null)
