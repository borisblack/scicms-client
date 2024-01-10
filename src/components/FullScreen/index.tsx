import {CSSProperties, ReactNode, useMemo} from 'react'
import './FullScreen.css'

interface Props {
    active: boolean
    fullScreenStyle?: CSSProperties
    normalStyle?: CSSProperties
    children?: ReactNode
}

const defaultFullScreenStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    overflow: 'hidden',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    outline: 0
}

const defaultNormalStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden'
}

export default function FullScreen({active, fullScreenStyle, normalStyle, children}: Props) {
    const wrapperStyle: CSSProperties = useMemo(
        () => active ? {...defaultFullScreenStyle, ...fullScreenStyle} : {...defaultNormalStyle, ...normalStyle},
        [active, fullScreenStyle, normalStyle]
    )

    return (
        <div className={`full-screen-wrapper ${active ? 'full-screen-wrapper-active' : ''}`} style={wrapperStyle}>
            {children}
        </div>
    )
}