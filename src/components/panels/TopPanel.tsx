import {useState} from 'react'
import {HorizontalPanelProps} from '.'
import styles from './TopPanel.module.css'

export default function TopPanel({title, height, initialExpanded, style, stickerStyle, children}: HorizontalPanelProps) {
    const [internalHeight, setInternalHeight] = useState(initialExpanded ? height : 0)

    function togglePanelHeight() {
        setInternalHeight(Math.abs(internalHeight - height))
    }

    return (
        <>
            <div className={styles.topPanelSticker} style={{...stickerStyle, top: internalHeight}} onClick={togglePanelHeight}>
                {title}
            </div>
            <div className={styles.topPanel} style={{...style, height: internalHeight}}>
                {children}
            </div>
        </>
    )
}
