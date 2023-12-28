import styles from './Sources.module.css'

interface LineHorizontalProps {
    className?: string
    y: number
    x1: number
    x2: number
    onClick?: () => void
}

const LineHorizontal = ({className, y, x1, x2, onClick}: LineHorizontalProps) =>
    <div
        className={`${className || ''} ${styles.lineHorizontal}`}
        style={{top: y, left: x1, width: x2 - x1}}
        onClick={onClick}
    />

export default LineHorizontal