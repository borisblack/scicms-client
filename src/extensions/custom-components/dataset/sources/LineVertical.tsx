import styles from './Sources.module.css'

interface LineVerticalProps {
    className?: string
    x: number
    y1: number
    y2: number
    onClick?: () => void
}

const LineVertical = ({className, x, y1, y2, onClick}: LineVerticalProps) =>
    <div
        className={`${className || ''} ${styles.lineVertical}`}
        style={{left: x, top: y1, height: y2 - y1}}
        onClick={onClick}
    />

export default LineVertical