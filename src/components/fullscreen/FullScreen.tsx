import {CSSProperties, ReactNode, useMemo} from 'react'
import styles from './FullScreenWrapper.module.css'

interface Props {
    active: boolean
    fullScreenStyle?: CSSProperties
    normalStyle?: CSSProperties
    children?: ReactNode
}

const defaultFullScreenStyle: CSSProperties = {position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', zIndex: 2}
const defaultNormalStyle: CSSProperties = {position: 'relative'}

export default function FullScreen({active, fullScreenStyle, normalStyle, children}: Props) {
    const wrapperStyle: CSSProperties = useMemo(
        () => active ? {...defaultFullScreenStyle, ...fullScreenStyle} : {...defaultNormalStyle, ...normalStyle},
        [active, fullScreenStyle, normalStyle]
    )

    return (
        <div className={styles.fullScreenWrapper} style={wrapperStyle}>
            {children}
        </div>
    )
}