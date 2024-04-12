import React, {FC} from 'react'
import {useTranslation} from 'react-i18next'
import styles from './TaskListHeader.module.css'

interface TaskListHeaderProps {
    headerHeight: number
    rowWidth: string
    fontFamily: string
    fontSize: string
}

const TaskListHeader: FC<TaskListHeaderProps> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
  const {t} = useTranslation()

  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2
        }}
      >
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth
          }}
        >
                    &nbsp;{t('Name')}
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth
          }}
        >
                    &nbsp;{t('Start')}
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth
          }}
        >
                    &nbsp;{t('End')}
        </div>
      </div>
    </div>
  )
}

export default TaskListHeader