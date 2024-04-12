import {FC} from 'react'
import {Task as GanttTask} from 'gantt-task-react'
import {DateTime} from 'luxon'

import styles from './TooltipContent.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../../../config'
import {UTC} from '../../../../../config/constants'

interface TooltipContentProps {
    task: GanttTask
    fontSize: string
    fontFamily: string
}

const {luxonDisplayDateTimeFormatString} = appConfig.dateTime

const TooltipContent: FC<TooltipContentProps> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily
  }
  const {t} = useTranslation()
  const start = DateTime.fromJSDate(task.start, {zone: UTC})
  const end = DateTime.fromJSDate(task.end, {zone: UTC})

  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <h5 style={{fontWeight: 600}}>
        {`${task.name}: ${start.toFormat(luxonDisplayDateTimeFormatString)} - ${end.toFormat(luxonDisplayDateTimeFormatString)}`}
      </h5>

      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>
          {`${t('Duration')} (${t('days')}): ${~~((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))}`}
        </p>
      )}

      {!!task.progress && (
        <p className={styles.tooltipDefaultContainerParagraph}>
          {`${t('Progress')}: ${task.progress} %`}
        </p>
      )}

    </div>
  )
}

export default TooltipContent