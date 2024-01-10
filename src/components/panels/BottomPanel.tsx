import {useState} from 'react'
import {HorizontalPanelProps} from '.'
import styles from './BottomPanel.module.css'

export default function BottomPanel({title, height, initialExpanded, style, stickerStyle, children}: HorizontalPanelProps) {
    const [internalHeight, setInternalHeight] = useState(initialExpanded ? height : 0)

    function togglePanelHeight() {
        setInternalHeight(Math.abs(internalHeight - height))
    }

    return (
        <>
            <div className={styles.bottomPanelSticker} style={{...stickerStyle, bottom: internalHeight}} onClick={togglePanelHeight}>
                {title}
            </div>
            <div className={styles.bottomPanel} style={{...style, height: internalHeight}}>
                {children}
            </div>
        </>
    )
}
