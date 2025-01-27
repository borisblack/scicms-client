import styles from './LineHorizontal.module.css'

interface LineHorizontalProps {
  y: number
  x1: number
  x2: number
  valid: boolean
  onClick?: () => void
}

const LineHorizontal = ({y, x1, x2, valid, onClick}: LineHorizontalProps) => (
  <div
    className={`${styles.lineHorizontal} ${valid ? styles.valid : styles.invalid}`}
    style={{top: y, left: x1, width: x2 - x1}}
    onClick={onClick}
  />
)

export default LineHorizontal
