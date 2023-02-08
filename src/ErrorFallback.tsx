import {useTranslation} from 'react-i18next'
import {Divider} from 'antd'
import styles from './ErrorFallback.module.css'
import {useRouteError} from 'react-router-dom'

export default function ErrorFallback() {
    const error = useRouteError() as Error
    const {t} = useTranslation()

    return (
        <div className={styles.container}>
            <p className={styles.smile}>:(</p>
            <p className={styles.title}>{t('Oops! An error has occurred')}</p>
            <Divider/>
            <p className={styles.desc}>{t('Client application error')}</p>
            <div className={styles.small}>
                <p>{t('Try to do the following')}:</p>
                <ul>
                    <li>{t('restart the program')};</li>
                    <li>{t('check network connection')};</li>
                    <li>{t('contact administrator')}.</li>
                </ul>
            </div>
            <p className={styles.label}>{error.message}</p>
            <Divider/>
        </div>
    )
}
