import styles from './DashFieldOverlay.module.css'

export enum OverlayType {
    IllegalMoveHover = 'Illegal',
    LegalMoveHover = 'Legal',
    PossibleMove = 'Possible'
}

interface DashFieldOverlayProps {
    type: OverlayType
}

function getOverlayColor(type: OverlayType): string {
  switch (type) {
    case OverlayType.IllegalMoveHover:
      return 'red'
    case OverlayType.LegalMoveHover:
      return 'green'
    case OverlayType.PossibleMove:
      return 'yellow'
  }
}

export default function DashFieldOverlay({type}: DashFieldOverlayProps) {
  const color = getOverlayColor(type)
  return (
    <div
      role={type}
      className={styles.dashFieldOverly}
      style={{
        minHeight: 4,
        opacity: 0.5,
        backgroundColor: color
      }}
    />
  )
}
