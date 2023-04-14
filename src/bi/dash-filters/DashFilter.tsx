import {Dataset, QueryOp} from '../../types'
import {Button, Form, FormInstance, Select, Space, Switch} from 'antd'
import React, {CSSProperties} from 'react'
import {useTranslation} from 'react-i18next'
import {queryOpList, queryOpTitles} from '../../util/bi'
import styles from './DashFilters.module.css'
import FilterValueFieldWrapper from './FilterValueFieldWrapper'
import {EyeOutlined} from '@ant-design/icons'

interface Props {
    style?: CSSProperties
    btnStyle?: CSSProperties
    form: FormInstance
    namePrefix: (string|number)[]
    dataset: Dataset
    onRemove: () => void
}

const {Item: FormItem, useWatch} = Form
const {Option: SelectOption} = Select

export default function DashFilter({style, btnStyle, form, namePrefix, dataset, onRemove}: Props) {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {columns} = dataset.spec
    const colNames: string[] = Object.keys(columns)
    const {t} = useTranslation()
    const columnName = useWatch([...namePrefix, 'columnName'], form)
    const column = columnName ? columns[columnName] : undefined
    const availableOpList = column ? queryOpList(column.type) : []
    const op = useWatch([...namePrefix, 'op'], form)

    function handleColumnNameSelect(newColumnName: string) {
        form.setFieldValue([...namePrefix, 'op'], undefined)
        form.setFieldValue([...namePrefix, 'value'], undefined)
    }

    function handleOpSelect(newOp: QueryOp) {
        form.setFieldValue([...namePrefix, 'value'], undefined)
    }

    return (
        <div style={style}>
            <Space>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'columnName']}
                    rules={[{required: true, message: ''}]}
                >
                    <Select style={{width: 160}} placeholder={t('Column Name')} onSelect={handleColumnNameSelect}>
                        {colNames.map(cn => <SelectOption key={cn} value={cn}>{columns[cn].alias ?? cn}</SelectOption>)}
                    </Select>
                </FormItem>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'op']}
                    rules={[{required: true, message: ''}]}
                >
                    <Select style={{width: 160}} placeholder={t('Operator')} onSelect={handleOpSelect}>
                        {availableOpList.map(o => <SelectOption key={o} value={o}>{queryOpTitles[o]}</SelectOption>)}
                    </Select>
                </FormItem>

                {column?.type && op && (
                    <FilterValueFieldWrapper form={form} namePrefix={namePrefix} type={column?.type} op={op}/>
                )}

                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'show']}
                    valuePropName="checked"
                >
                    <Switch
                        title={t('Show')}
                        checkedChildren={<EyeOutlined/>}
                        unCheckedChildren={<EyeOutlined/>}
                    />
                </FormItem>

                <Button
                    style={btnStyle}
                    danger
                    title={t('Remove Filter')}
                    onClick={onRemove}>
                    -
                </Button>
            </Space>
        </div>
    )
}