import {useTranslation} from 'react-i18next'
import {Button, Drawer, Form, Space, Tooltip} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'

import {fromFormQueryBlock, getCustomFunctionsInfo, saveSessionFilters, toFormQueryBlock} from './util/util'
import DashFilters from './DashFilters/DashFilters'
import {Dataset, IDash, QueryBlock} from '../types/bi'
import {useAppProperties} from 'src/util/hooks'

interface FiltersModalProps {
  dash: IDash
  dashboardId: string
  dataset: Dataset
  filters: QueryBlock
  open: boolean
  onChange: (filters: QueryBlock) => void
  onClose: () => void
}

export interface FiltersFormValues {
  filters: QueryBlock
}

export default function FiltersModal({
  dash,
  dashboardId,
  dataset,
  filters,
  open,
  onChange,
  onClose
}: FiltersModalProps) {
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const {timeZone} = appProps.dateTime
  const [form] = Form.useForm()

  // Uncomment when using one form for multiple items
  // useEffect(() => {
  //     form.resetFields()
  // }, [filters])

  async function handleFormFinish(values: FiltersFormValues) {
    const newFilters = fromFormQueryBlock(dataset, timeZone, values.filters)
    saveSessionFilters(dashboardId, dash.id, newFilters)
    onChange(newFilters)
    onClose()
  }

  function cancelEdit() {
    form.resetFields()
    onClose()
  }

  if (dataset == null) return null

  return (
    <Drawer
      className="no-drag"
      destroyOnClose
      open={open}
      width="60%"
      title={
        <Space style={{fontSize: 16}}>
          {t('Filters')}
          <Tooltip
            placement="rightBottom"
            overlayInnerStyle={{width: 600}}
            title={
              <>
                {getCustomFunctionsInfo().map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </>
            }
          >
            <QuestionCircleOutlined className="blue" />
          </Tooltip>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={cancelEdit}>{t('Cancel')}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            OK
          </Button>
        </Space>
      }
      // onOk={() => filtersForm.submit()}
      onClose={onClose}
    >
      <Form form={form} size="small" layout="vertical" onFinish={handleFormFinish}>
        <DashFilters
          namePrefix={['filters']}
          dataset={dataset}
          initialBlock={toFormQueryBlock(dataset, timeZone, filters)}
        />
      </Form>
    </Drawer>
  )
}
