import {useState} from 'react'
import {VerticalPanelProps} from '.'
import styles from './LeftPanel.module.css'

export default function LeftPanel({title, width, initialExpanded, style, stickerStyle, children}: VerticalPanelProps) {
    const [internalWith, setInternalWith] = useState(initialExpanded ? width : 0)

    function togglePanelWidth() {
        setInternalWith(Math.abs(internalWith - width))
    }

    return (
        <>
            <div className={styles.leftPanelSticker} style={{...stickerStyle, left: internalWith}} onClick={togglePanelWidth}>
                {title}
            </div>
            <div className={styles.leftPanel} style={{...style, width: internalWith}}>
                {children}
            </div>
        </>
    )
}
