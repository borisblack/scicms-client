import {Drawer} from 'antd'
import ExecutionStatistic from './ExecutionStatistic'
import {useTranslation} from 'react-i18next'
import {ExecutionStatisticInfo} from '../types/bi'

interface ExecutionStatisticModalProps extends ExecutionStatisticInfo {
  open: boolean
  onClose: () => void
}

export default function ExecutionStatisticModal({
  timeMs,
  cacheHit,
  query,
  params,
  open,
  onClose
}: ExecutionStatisticModalProps) {
  const {t} = useTranslation()

  return (
    <Drawer
      className="no-drag"
      title={t('Execution statistic')}
      width="40%"
      open={open}
      destroyOnClose
      onClose={onClose}
    >
      <ExecutionStatistic timeMs={timeMs} cacheHit={cacheHit} query={query} params={params} />
    </Drawer>
  )
}
