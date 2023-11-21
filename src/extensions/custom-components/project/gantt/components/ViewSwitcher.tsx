import {ViewMode} from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import styles from './ViewSwitcher.module.css'
import {useTranslation} from 'react-i18next'

interface ViewSwitcherProps {
    isChecked: boolean
    onViewListChange: (isChecked: boolean) => void
    onViewModeChange: (viewMode: ViewMode) => void
}

export default function ViewSwitcher({isChecked, onViewModeChange, onViewListChange}: ViewSwitcherProps) {
    const {t} = useTranslation()

    return (
        <div className={styles.viewContainer}>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.Hour)}>
                {t('Hour')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.QuarterDay)}>
                {t('Quarter of Day')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.HalfDay)}>
                {t('Half of Day')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.Day)}>
                {t('Day')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.Week)}>
                {t('Week')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.Month)}>
                {t('Month')}
            </button>
            <button className={styles.button} onClick={() => onViewModeChange(ViewMode.Year)}>
                {t('Year')}
            </button>

            <div className={styles.switch}>
                <label className={styles.switch_Toggle}>
                    <input type="checkbox" defaultChecked={isChecked} onClick={() => onViewListChange(!isChecked)}/>
                    <span className={styles.slider} />
                </label>
                {t('Show Task List')}
            </div>
        </div>
    )
}