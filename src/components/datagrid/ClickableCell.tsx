import styles from './ClickableCell.module.css'
import {useTranslation} from 'react-i18next'

interface ClickableCellProps {
    value: any
    onClick: (value: any) => void
}

export default function ClickableCell({value, onClick}: ClickableCellProps) {
  const {t} = useTranslation()

  function handleClick() {
    onClick(value)
  }

  return (
    <div
      className={styles.clickableCell}
      title={t('Edit')}
      onClick={handleClick}
    >
      {value}
    </div>
  )
}