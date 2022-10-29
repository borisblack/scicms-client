import {CSSProperties, ReactNode} from 'react'

interface PanelProps {
    title: string
    initialExpanded?: boolean
    style?: CSSProperties
    stickerStyle?: CSSProperties
    children?: ReactNode
}

export interface HorizontalPanelProps extends PanelProps {
    height: number
}

export interface VerticalPanelProps extends PanelProps {
    width: number
}