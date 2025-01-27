import {useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Select, Space} from 'antd'
import {DefaultOptionType} from 'rc-select/lib/Select'

import {Column, Dataset, ISelector, QueryOp, SelectorFilter} from 'src/types/bi'
import {queryOpTitles} from 'src/bi/util'
import {requiredFieldRule} from 'src/util/form'
import FilterValueFieldWrapper from '../DashFilters/FilterValueFieldWrapper'
import {usePrevious} from 'src/util/hooks'
import styles from './SelectorValue.module.css'
import {ReloadOutlined} from '@ant-design/icons'

interface SelectorValueProps {
  namePrefix: string[]
  selector: ISelector
  datasetMap: Record<string, Dataset>
}

export interface SelectorValueFormValues {
  selectorFilter: SelectorFilter
}

const {Item: FormItem} = Form

export default function SelectorValue({namePrefix, selector, datasetMap}: SelectorValueProps) {
  const {t} = useTranslation()
  const form = Form.useFormInstance()
  const {dataset: datasetName, field: fieldName, type, op, value} = selector
  const dataset = useMemo(() => (datasetName ? datasetMap[datasetName] : undefined), [datasetName, datasetMap])
  const field: Column = useMemo(
    () => (dataset ? dataset.spec.columns[fieldName] : {type, custom: true, hidden: false}),
    [dataset, fieldName]
  )
  const fieldOptions: DefaultOptionType[] = useMemo(
    () =>
      dataset
        ? [{label: dataset.spec.columns[fieldName].alias || fieldName, value: fieldName}]
        : [{label: fieldName, value: fieldName}],
    [dataset, fieldName]
  )
  const prevSelector = usePrevious(selector)

  useEffect(() => {
    if (
      prevSelector?.field !== selector.field ||
      prevSelector?.op !== selector.op ||
      prevSelector?.value !== selector.value ||
      prevSelector?.extra !== selector.extra
    )
      form.resetFields()
  }, [selector])

  return (
    <Space>
      <FormItem className={styles.formItem} name={[...namePrefix, 'field']} rules={[requiredFieldRule()]}>
        <Select bordered={false} disabled style={{width: 160}} placeholder={t('Field name')} options={fieldOptions} />
      </FormItem>

      <FormItem className={styles.formItem} name={[...namePrefix, 'op']} rules={[requiredFieldRule()]}>
        <Select
          bordered={false}
          disabled
          style={{width: 160}}
          placeholder={t('Operator')}
          options={[
            {
              label: queryOpTitles[op],
              value: op
            }
          ]}
        />
      </FormItem>

      <FilterValueFieldWrapper form={form} namePrefix={namePrefix} column={field} op={op} />

      <Button
        type="text"
        icon={<ReloadOutlined />}
        title={t('Apply')}
        onMouseDown={e => e.stopPropagation()}
        onClick={() => form.submit()}
      />
    </Space>
  )
}
