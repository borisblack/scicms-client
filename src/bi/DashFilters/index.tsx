import {Button, Form, Select} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'
import {v4 as uuidv4} from 'uuid'
import {Dataset, QueryBlock} from 'src/types/bi'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {generateQueryBlock, logicalOpTitles, positiveLogicalOps} from '../util'
import DashFilter from './DashFilter'
import styles from './DashFilters.module.css'

interface DashFiltersProps {
    namePrefix: (string|number)[]
    dataset: Dataset
    initialBlock?: QueryBlock
    showLogicalOp?: boolean
    onRemove?: () => void
}

const {Item: FormItem, List: FormList} = Form
const {Option: SelectOption} = Select
const TOOLBAR_HEIGHT = 24
const LOGICAL_OP_FIELD_WIDTH = 75
const BTN_WIDTH = 40
const H_SPACE = 4, V_SPACE = 6
const INDENT = 12

export default function DashFilters({namePrefix, dataset, initialBlock, showLogicalOp, onRemove}: DashFiltersProps) {
  if (namePrefix.length === 0)
    throw new Error('Illegal argument')

  const form = Form.useFormInstance()
  const fieldName = namePrefix[namePrefix.length - 1]
  const startBtnLeft = showLogicalOp ? (LOGICAL_OP_FIELD_WIDTH + H_SPACE) : 0
  const {t} = useTranslation()

  return (
    <div style={{position: 'relative'}}>
      {showLogicalOp ? (
        <FormItem
          className={styles.formItem}
          name={[fieldName, 'logicalOp']}
          rules={[{required: true, message: t('Required field')}]}
        >
          <Select
            bordered={false}
            style={{width: LOGICAL_OP_FIELD_WIDTH, height: TOOLBAR_HEIGHT, marginBottom: V_SPACE}}
            placeholder={t('Logical Operator')}
          >
            {positiveLogicalOps.map(p => <SelectOption key={p} value={p}>{logicalOpTitles[p]}</SelectOption>)}
          </Select>
        </FormItem>
      ) : (
        <div style={{height: TOOLBAR_HEIGHT, marginBottom: V_SPACE}}/>
      )}

      <FormList name={[fieldName, 'filters']} initialValue={initialBlock?.filters}>
        {(fields, {add, remove}) => (
          <>
            <Button
              style={{position: 'absolute', width: BTN_WIDTH, height: TOOLBAR_HEIGHT, top: 0, left: startBtnLeft}}
              // type="primary"
              title={t('Add Filter')}
              onClick={() => add({id: uuidv4()})}
            >
                            +
            </Button>

            <div style={{marginLeft: INDENT}}>
              {fields.map(filterField => {
                const {key, name: filterFieldNumber, ...rest} = filterField
                return (
                  <DashFilter
                    key={key}
                    style={{marginBottom: V_SPACE}}
                    btnStyle={{width: BTN_WIDTH}}
                    form={form}
                    namePrefix={[...namePrefix, 'filters', filterFieldNumber]}
                    dataset={dataset}
                    onRemove={() => remove(filterFieldNumber)}
                  />
                )
              })}
            </div>
          </>
        )}
      </FormList>

      <FormList name={[fieldName, 'blocks']} initialValue={initialBlock?.blocks}>
        {(fields, {add, remove}) => (
          <>
            <Button
              style={{position: 'absolute', width: BTN_WIDTH, height: TOOLBAR_HEIGHT, top: 0, left: startBtnLeft + BTN_WIDTH + H_SPACE}}
              // type="primary"
              title={t('Add Block')}
              onClick={() => add(generateQueryBlock())}
            >
              {'+ { }'}
            </Button>

            <div style={{marginLeft: INDENT}}>
              {fields.map(blockField => {
                const {key, name: blockFieldNumber, ...rest} = blockField
                return (
                  <DashFilters
                    key={key}
                    namePrefix={[...namePrefix, 'blocks', blockFieldNumber]}
                    dataset={dataset}
                    showLogicalOp
                    onRemove={() => remove(blockFieldNumber)}
                  />
                )
              })}
            </div>
          </>
        )}
      </FormList>

      {onRemove && (
        <Button
          danger
          style={{position: 'absolute', width: BTN_WIDTH, height: TOOLBAR_HEIGHT, top: 0, left: startBtnLeft + BTN_WIDTH*2 + H_SPACE*2}}
          title={t('Remove Block')}
          type="text"
          onClick={onRemove}
        >
          <DeleteOutlined/>
        </Button>
      )}
    </div>
  )
}