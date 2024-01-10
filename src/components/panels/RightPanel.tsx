import {useState} from 'react'
import {VerticalPanelProps} from '.'
import styles from './RightPanel.module.css'

export default function RightPanel({title, width, initialExpanded, style, stickerStyle, children}: VerticalPanelProps) {
    const [internalWith, setInternalWith] = useState(initialExpanded ? width : 0)

    function togglePanelWidth() {
        setInternalWith(Math.abs(internalWith - width))
    }

    return (
        <>
            <div className={styles.rightPanelSticker} style={{...stickerStyle, right: internalWith}} onClick={togglePanelWidth}>
                {title}
            </div>
            <div className={styles.rightPanel} style={{...style, width: internalWith}}>
                {children}
            </div>
        </>
    )
}
