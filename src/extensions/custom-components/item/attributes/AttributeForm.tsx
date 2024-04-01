import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {AutoComplete, Checkbox, Col, Form, FormInstance, Input, InputNumber, notification, Row, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types/'
import {RelType} from 'src/types/schema'
import appConfig from 'src/config'
import {regExpRule} from 'src/util/form'
import {LOWERCASE_NO_WHITESPACE_PATTERN} from 'src/config/constants'
import * as SequenceService from 'src/services/sequence'
import {NamedAttribute} from './types'
import {useRegistry} from 'src/util/hooks'
import styles from './Attributes.module.css'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'

interface Props {
  form: FormInstance
  attribute: NamedAttribute | null
  canEdit: boolean
  onFormFinish: (values: any) => void
}

interface OptionType {
  label: string
  value: string
}

const MIN_SEARCH_LENGTH = 2
const DEBOUNCE_WAIT_INTERVAL = 500

const {Item: FormItem} = Form
const {Option: SelectOption} = Select
const {TextArea} = Input

export default function AttributeForm({form, attribute, canEdit, onFormFinish}: Props) {
  const {items: itemMap} = useRegistry()
  const {t} = useTranslation()
  const [attrType, setAttrType] = useState<FieldType | undefined>(attribute?.type)
  const [relType, setRelType] = useState<RelType | undefined>(attribute?.relType)
  const [target, setTarget] = useState<string | undefined>(attribute?.target)
  const [seqNameOptions, setSeqNameOptions] = useState<OptionType[]>([])
  const [targetOptions, setTargetOptions] = useState<OptionType[]>([])
  const [intermediateOptions, setIntermediateOptions] = useState<OptionType[]>([])
  const [mappedByOptions, setMappedByOptions] = useState<OptionType[]>([])
  const [inversedByOptions, setInversedByOptions] = useState<OptionType[]>([])
  const itemNames = useMemo(() => Object.keys(itemMap), [itemMap])
  const isCollectionRelation = attrType === FieldType.relation && (relType === RelType.oneToMany || relType === RelType.manyToMany)

  useEffect(() => {
    form.resetFields()
  }, [form, attribute])

  const handleSeqNameSearch = _.debounce(async (value: string) => {
    setSeqNameOptions([])
    if (value.length < MIN_SEARCH_LENGTH)
      return

    try {
      const sequences = await SequenceService.fetchSequencesByName(value)
      setSeqNameOptions(sequences.map(it => ({label: it.name, value: it.name})))
    } catch (e: any) {
      notification.error({
          message: t('Request error'),
          description: e.message
      })
    }
  }, DEBOUNCE_WAIT_INTERVAL)

  const handleTargetSearch = _.debounce((value: string) => {
    setTargetOptions([])
    if (value.length < MIN_SEARCH_LENGTH)
      return

    const regExp = new RegExp(value, 'i')
    const targets = itemNames.filter(it => it.match(regExp))
    setTargetOptions(targets.map(it => ({label: it, value: it})))
  }, DEBOUNCE_WAIT_INTERVAL)

  const handleIntermediateSearch = _.debounce((value: string) => {
    setIntermediateOptions([])
    if (value.length < MIN_SEARCH_LENGTH)
      return

    const regExp = new RegExp(value, 'i')
    const intermediates = itemNames.filter(it => it.match(regExp))
    setIntermediateOptions(intermediates.map(it => ({label: it, value: it})))
  }, DEBOUNCE_WAIT_INTERVAL)

  const getTargetRelationAttributes = useCallback(() => {
    if (!target)
      return []

    const allTargetAttributes = itemMap[target].spec.attributes
    if (relType === RelType.oneToOne || relType === RelType.oneToMany) {
      return Object.keys(allTargetAttributes).filter(key => {
        const targetAttribute = allTargetAttributes[key]
        return targetAttribute.relType === RelType.manyToOne || targetAttribute.relType === RelType.manyToMany
      })
    } else {
      return Object.keys(allTargetAttributes).filter(key => {
        const targetAttribute = allTargetAttributes[key]
        return targetAttribute.relType === RelType.oneToOne || targetAttribute.relType === RelType.oneToMany
      })
    }
  }, [itemMap, relType, target])

  const handleMappedBySearch = _.debounce((value: string) => {
    setMappedByOptions([])
    if (!target || value.length < MIN_SEARCH_LENGTH)
      return

    const targetAttributes = getTargetRelationAttributes()
    const regExp = new RegExp(value, 'i')
    const mappedByList = targetAttributes.filter(it => it.match(regExp))
    setMappedByOptions(mappedByList.map(it => ({label: it, value: it})))
  }, DEBOUNCE_WAIT_INTERVAL)

  const handleInversedBySearch = _.debounce((value: string) => {
    setInversedByOptions([])
    if (!target || value.length < MIN_SEARCH_LENGTH)
      return

    const targetAttributes = getTargetRelationAttributes()
    const regExp = new RegExp(value, 'i')
    const inversedByList = targetAttributes.filter(it => it.match(regExp))
    setInversedByOptions(inversedByList.map(it => ({label: it, value: it})))
  }, DEBOUNCE_WAIT_INTERVAL)

  return (
    <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <FormItem
            className={styles.formItem}
            name="name"
            label={t('Name')}
            initialValue={attribute?.name}
            rules={[
                {required: true, message: t('Required field')},
                regExpRule(LOWERCASE_NO_WHITESPACE_PATTERN)
            ]}
          >
            <Input style={{maxWidth: 300}} maxLength={50} disabled={attribute?.name != null}/>
          </FormItem>

          <FormItem
            className={styles.formItem}
            name="type"
            label={t('Type')}
            initialValue={attribute?.type}
            rules={[{required: true, message: t('Required field')}]}
          >
            <Select
              style={{maxWidth: 200}}
              options={Object.keys(FieldType).sort().map(ft => ({
                value: ft,
                label: (
                  <span className="text-ellipsis">
                    <FieldTypeIcon fieldType={ft as FieldType}/>
                    &nbsp;&nbsp;
                    {ft}
                  </span>
                )
              }))}
              onSelect={(val: FieldType) => setAttrType(val)}
            />
          </FormItem>

          <FormItem
            className={styles.formItem}
            name="sortOrder"
            label={t('Sort Order')}
            initialValue={attribute?.sortOrder}
            rules={[{type: 'number', min: 0}]}
        >
              <InputNumber style={{width: 150}} min={0}/>
          </FormItem>

          {!isCollectionRelation && (
            <FormItem
              className={styles.formItem}
              name="columnName"
              label={t('Column Name')}
              initialValue={attribute?.columnName}
            >
              <Input style={{maxWidth: 300}} maxLength={50}/>
            </FormItem>
          )}

          <FormItem
            className={styles.formItem}
            name="displayName"
            label={t('Display Name')}
            initialValue={attribute?.displayName}
            rules={[{required: true, message: t('Required field')}]}
          >
            <Input style={{maxWidth: 300}} maxLength={50}/>
          </FormItem>

          <FormItem
            className={styles.formItem}
            name="description"
            label={t('Description')}
            initialValue={attribute?.description}
          >
            <Input maxLength={250}/>
          </FormItem>

          {!isCollectionRelation && (
            <>
              <FormItem
                className={styles.formItem}
                name="required"
                valuePropName="checked"
                initialValue={attribute?.required}
              >
                <Checkbox>{t('Required')}</Checkbox>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="defaultValue"
                label={t('Default Value')}
                initialValue={attribute?.defaultValue}
              >
                <Input style={{maxWidth: 300}} maxLength={50}/>
              </FormItem>
            </>
          )}

          {attribute?.keyed && (
            <FormItem
              className={styles.formItem}
              name="keyed"
              valuePropName="checked"
              initialValue={attribute?.keyed}
            >
              <Checkbox disabled>{t('Keyed')}</Checkbox>
            </FormItem>
          )}

          {!isCollectionRelation && (
            <>
              <FormItem
                className={styles.formItem}
                name="unique"
                valuePropName="checked"
                initialValue={attribute?.unique}
              >
                <Checkbox>{t('Unique')}</Checkbox>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="indexed"
                valuePropName="checked"
                initialValue={attribute?.indexed}
              >
                <Checkbox>{t('Indexed')}</Checkbox>
              </FormItem>
            </>
          )}

          <FormItem
            className={styles.formItem}
            name="private"
            valuePropName="checked"
            initialValue={attribute?.private}
          >
            <Checkbox>{t('Private')}</Checkbox>
          </FormItem>

          <FormItem
            className={styles.formItem}
            name="readOnly"
            valuePropName="checked"
            initialValue={attribute?.readOnly}
          >
            <Checkbox>{t('Read Only')}</Checkbox>
          </FormItem>

          {attrType === FieldType.password && (
            <>
              <FormItem
                className={styles.formItem}
                name="confirm"
                valuePropName="checked"
                initialValue={attribute?.confirm}
              >
                <Checkbox>{t('Confirm')}</Checkbox>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="encode"
                valuePropName="checked"
                initialValue={attribute?.encode}
              >
                <Checkbox>{t('Encode')}</Checkbox>
              </FormItem>
            </>
          )}
        </Col>

        <Col span={12}>
          {attrType === FieldType.enum && (
            <FormItem
              className={styles.formItem}
              name="enumSet"
              label={t('Enum Set')}
              initialValue={attribute?.enumSet?.join('\n')}
              rules={[{required: true, message: t('Required field')}]}
            >
              <TextArea style={{maxWidth: 180}} rows={appConfig.ui.form.textAreaRows}/>
            </FormItem>
          )}

          {attrType === FieldType.sequence && (
            <FormItem
              className={styles.formItem}
              name="seqName"
              label={t('Sequence Name')}
              initialValue={attribute?.seqName}
              rules={[{required: true, message: t('Required field')}]}
            >
              <AutoComplete
                options={seqNameOptions}
                style={{width: 300}}
                onSearch={handleSeqNameSearch}
                placeholder={t('Sequence Name')}
              />
            </FormItem>
          )}

          {attrType === FieldType.relation && (
            <>
              <FormItem
                className={styles.formItem}
                name="relType"
                label={t('Relation Type')}
                initialValue={attribute?.relType}
                rules={[{required: true, message: t('Required field')}]}
              >
                <Select style={{maxWidth: 200}} onSelect={(val: RelType) => setRelType(val)}>
                  {Object.keys(RelType).map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="target"
                label={t('Target Item')}
                initialValue={attribute?.target}
                rules={[{required: true, message: t('Required field')}]}
              >
                <AutoComplete
                  options={targetOptions}
                  style={{width: 300}}
                  onSearch={handleTargetSearch}
                  onSelect={(value: string) => setTarget(value)}
                  placeholder={t('Target Item')}
                />
              </FormItem>

              {relType === RelType.manyToMany && (
                <FormItem
                  className={styles.formItem}
                  name="intermediate"
                  label={t('Intermediate Item')}
                  initialValue={attribute?.intermediate}
                  rules={[{required: true, message: t('Required field')}]}
                >
                  <AutoComplete
                    options={intermediateOptions}
                    style={{width: 300}}
                    onSearch={handleIntermediateSearch}
                    placeholder={t('Intermediate Item')}
                  />
                </FormItem>
              )}

              {target && (
                <>
                  <FormItem
                    className={styles.formItem}
                    name="mappedBy"
                    label={t('Mapped By')}
                    initialValue={attribute?.mappedBy}
                  >
                    <AutoComplete
                      options={mappedByOptions}
                      style={{width: 300}}
                      onSearch={handleMappedBySearch}
                      placeholder={t('Mapped By')}
                    />
                  </FormItem>

                  <FormItem
                    className={styles.formItem}
                    name="inversedBy"
                    label={t('Inversed By')}
                    initialValue={attribute?.inversedBy}
                  >
                    <AutoComplete
                      options={inversedByOptions}
                      style={{width: 300}}
                      onSearch={handleInversedBySearch}
                      placeholder={t('Inversed By')}
                    />
                  </FormItem>
                </>
              )}
            </>
          )}

          {attrType === FieldType.string && (
            <>
              <FormItem
                  className={styles.formItem}
                  name="length"
                  label={t('Length')}
                  initialValue={attribute?.length}
                  rules={[
                      {required: true, message: t('Required field')},
                      {type: 'number', min: 0}
                  ]}
              >
                  <InputNumber style={{width: 150}} min={0}/>
              </FormItem>

              <FormItem
                  className={styles.formItem}
                  name="pattern"
                  label={t('Pattern')}
                  initialValue={attribute?.pattern}
              >
                  <Input style={{maxWidth: 300}} maxLength={50}/>
              </FormItem>
            </>
          )}

          {attrType === FieldType.decimal && (
            <>
              <FormItem
                className={styles.formItem}
                name="precision"
                label={t('Precision')}
                initialValue={attribute?.precision}
                rules={[{type: 'number', min: 0, max: 22}]}
              >
                <InputNumber style={{width: 150}} min={0} max={22}/>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="scale"
                label={t('Scale')}
                initialValue={attribute?.scale}
                rules={[{type: 'number', min: 0, max: 22}]}
              >
                <InputNumber style={{width: 150}} min={0} max={22}/>
              </FormItem>
            </>
          )}

          {(attrType === FieldType.int || attrType === FieldType.long || attrType === FieldType.float || attrType === FieldType.double || attrType === FieldType.decimal) && (
            <>
              <FormItem
                className={styles.formItem}
                name="minRange"
                label={t('Min Range')}
                initialValue={attribute?.minRange}
                rules={[{type: 'number'}]}
              >
                <InputNumber style={{width: 150}}/>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="maxRange"
                label={t('Max Range')}
                initialValue={attribute?.maxRange}
                rules={[{type: 'number'}]}
              >
                <InputNumber style={{width: 150}}/>
              </FormItem>
            </>
          )}

          {!isCollectionRelation && (
            <>
              <FormItem
                className={styles.formItem}
                name="colWidth"
                label={t('Column Width')}
                initialValue={attribute?.colWidth}
                rules={[{type: 'number', min: 0}]}
              >
                <InputNumber style={{width: 150}} min={0}/>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="colHidden"
                valuePropName="checked"
                initialValue={attribute?.colHidden}
              >
                <Checkbox>{t('Column Hidden')}</Checkbox>
              </FormItem>

              <FormItem
                className={styles.formItem}
                name="fieldWidth"
                label={t('Field Width')}
                initialValue={attribute?.fieldWidth}
                rules={[{type: 'number', min: 0}]}
              >
                <InputNumber style={{width: 150}} min={0}/>
              </FormItem>
            </>
          )}

          <FormItem
            className={styles.formItem}
            name="fieldHidden"
            valuePropName="checked"
            initialValue={attribute?.fieldHidden}
          >
            <Checkbox>{t('Field Hidden')}</Checkbox>
          </FormItem>
        </Col>
      </Row>
    </Form>
  )
}