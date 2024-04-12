import styles from './LineVertical.module.css'

interface LineVerticalProps {
    className?: string
    x: number
    y1: number
    y2: number
    valid: boolean
    onClick?: () => void
}

const LineVertical = ({x, y1, y2, valid, onClick}: LineVerticalProps) =>
  <div
    className={`${styles.lineVertical} ${valid ? styles.valid : styles.invalid}`}
    style={{left: x, top: y1, height: y2 - y1}}
    onClick={onClick}
  />

export default LineVertical