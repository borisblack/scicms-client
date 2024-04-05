import _ from 'lodash'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Col, Form, Input, Row, Select, Space, Tooltip, Typography} from 'antd'
import {DeleteOutlined, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {DefaultOptionType} from 'rc-select/lib/Select'

import {ColumnType, Dataset, IDash, ISelector, SelectorLink, SelectorLinkType} from 'src/types/bi'
import {useBI} from '../util/hooks'
import {requiredFieldRule} from 'src/util/form'
import {datasetFieldTypeOptions, queryOpList, queryOpTitles} from '../util'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import styles from './SelectorForm.module.css'
import SelectorLinkTypeLabel from './SelectorLinkTypeLabel'

interface SelectorFormProps {
    selector: ISelector
    datasetMap: Record<string, Dataset>
    dashes: IDash[]
    canEdit: boolean
}

export interface SelectorFormValues extends ISelector {}

const {Item: FormItem, List: FormList} = Form
const {Link, Title} = Typography

export default function SelectorForm({selector, datasetMap, dashes, canEdit}: SelectorFormProps) {
  const form = Form.useFormInstance()
  const {t} = useTranslation()
  const {openDataset} = useBI({withDashboards: true})
  const datasetName = Form.useWatch('dataset', form)
  const dataset: Dataset | undefined = useMemo(() => datasetName ? datasetMap[datasetName] : undefined, [datasetName, datasetMap])
  const fieldOptions: DefaultOptionType[] = useMemo(() => {
    if (!dataset)
      return []

    return Object.entries(dataset.spec.columns).map(([curFieldName, curField]) => ({
      label: (
        <span className="text-ellipsis">
          <FieldTypeIcon fieldType={curField.type}/>
                    &nbsp;&nbsp;
          {curField.alias || curFieldName}
        </span>
      ),
      value: curFieldName
    }))
  }, [dataset])
  const fieldType: ColumnType | undefined = Form.useWatch('type', form)
  const opOptions: DefaultOptionType[] = useMemo(() => {
    if (!fieldType)
      return []

    return queryOpList(fieldType).map(op => ({
      label: queryOpTitles[op],
      value: op
    }))
  }, [fieldType])
  const links: SelectorLink[] = Form.useWatch('links', form) ?? []
  // const dashMap = useMemo(() => _.mapKeys(dashes, dash => dash.id), [dashes])
  // const availableDashes = useMemo(() => {
  //     const linkSet = new Set(links.map(link => link.dashId))
  //     return dashes.filter(dash => !linkSet.has(dash.id))
  // }, [dashes, links])
  // const prevSelector = usePrevious(selector)

  // Uncomment when using one form for multiple items
  // useEffect(() => {
  //     if (prevSelector?.id !== selector.id)
  //         form.resetFields()
  // }, [selector])

  function handleDatasetChange(newDataset?: string) {
    form.resetFields(['field', 'type', 'op'])
  }

  function handleFieldChange(newField?: string) {
    form.resetFields(['type', 'op'])
    if (newField && dataset) {
      form.setFieldValue('type', dataset.spec.columns[newField].type)
    }
  }

  function handleTypeChange(newType?: ColumnType) {
    form.resetFields(['op'])
  }

  return (
    <Row gutter={10}>
      <FormItem name={['id']} hidden>
        <Input/>
      </FormItem>

      <Col span={24}>
        <FormItem
          className={styles.formItem}
          name={['name']}
          label={t('Name')}
          rules={[requiredFieldRule()]}
        >
          <Input/>
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          className={styles.formItem}
          name={['dataset']}
          label={(
            <Space>
              {t('Dataset')}
              {dataset && (
                <Tooltip key="open" title={t('Open')}>
                  <Link onClick={() => openDataset(dataset.id)}>
                    <FolderOpenOutlined/>
                  </Link>
                </Tooltip>
              )}
            </Space>
          )}
        >
          <Select
            allowClear
            options={Object.keys(datasetMap).sort().map(d => ({label: d, value: d}))}
            onSelect={handleDatasetChange}
            onClear={handleDatasetChange}
          />
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          className={styles.formItem}
          name={['field']}
          label={t('Field')}
          rules={[requiredFieldRule()]}
        >
          {dataset ? (
            <Select
              allowClear
              options={fieldOptions}
              onSelect={handleFieldChange}
              onClear={handleFieldChange}
            />
          ) : (
            <Input/>
          )}
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          className={styles.formItem}
          name={['type']}
          label={t('Type')}
          rules={[requiredFieldRule()]}
        >
          <Select
            allowClear
            disabled={!canEdit || !!dataset}
            options={datasetFieldTypeOptions}
            onSelect={handleTypeChange}
            onClear={handleTypeChange}
          />
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          className={styles.formItem}
          name={['op']}
          label={t('Operator')}
          rules={[requiredFieldRule()]}
        >
          <Select
            allowClear
            options={opOptions}
          />
        </FormItem>
      </Col>
      <Col span={24}>
        <Title level={5}>{t('Links')}</Title>
        <FormList name={['links']}>
          {(fields, {add, remove}) => (
            <>
              {fields.map(linkField => {
                const {key, name: linkFieldNumber, ...rest} = linkField
                return (
                  <Row key={key} gutter={10}>
                    <Col span={14}>
                      <FormItem
                        name={[linkFieldNumber, 'dashId']}
                        rules={[requiredFieldRule()]}
                      >
                        <Select
                          placeholder={t('Dash')}
                          options={dashes.map(dash => ({
                            value: dash.id,
                            label: dash.name
                          }))}
                        />
                      </FormItem>
                    </Col>

                    <Col span={6}>
                      <FormItem
                        name={[linkFieldNumber, 'type']}
                        rules={[requiredFieldRule()]}
                      >
                        <Select
                          suffixIcon={null}
                          placeholder={t('Type')}
                          options={Object.keys(SelectorLinkType).map(linkType => ({
                            value: linkType,
                            label: <SelectorLinkTypeLabel linkType={linkType as SelectorLinkType}/>
                          }))}
                        />
                      </FormItem>
                    </Col>

                    <Col span={4}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
                        title={t('Remove')}
                        onClick={() => remove(linkFieldNumber)}
                      />
                    </Col>
                  </Row>
                )
              })}
              <Row gutter={10}>
                <Col span={4}>
                  <Button
                    icon={<PlusCircleOutlined/>}
                    onClick={() => add({type: SelectorLinkType.in})}
                  >
                    {t('Add')}
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </FormList>
      </Col>
    </Row>
  )
}