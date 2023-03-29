import {Button, Form, FormInstance, Select} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {Dataset, QueryBlock} from '../../types'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {generateQueryBlock} from '../../util/bi'
import {positiveQueryPredicates, queryPredicateTitles} from '../../util/bi'
import DashFilter from './DashFilter'
import styles from './DashFilters.module.css'

interface Props {
    form: FormInstance
    namePrefix: (string|number)[]
    dataset: Dataset
    initialBlock?: QueryBlock
    showPredicate?: boolean
    onRemove?: () => void
}

const {Item: FormItem, List: FormList} = Form
const {Option: SelectOption} = Select
const TOOLBAR_HEIGHT = 24
const PREDICATE_FIELD_WIDTH = 75
const BTN_WIDTH = 40
const H_SPACE = 4, V_SPACE = 6
const INDENT = 12

export default function DashFilters({form, namePrefix, dataset, initialBlock, showPredicate, onRemove}: Props) {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const startBtnLeft = showPredicate ? (PREDICATE_FIELD_WIDTH + H_SPACE) : 0
    const {t} = useTranslation()

    return (
        <div style={{position: 'relative'}}>
            {showPredicate ? (
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'predicate']}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select style={{width: PREDICATE_FIELD_WIDTH, height: TOOLBAR_HEIGHT, marginBottom: V_SPACE}} placeholder={t('Predicate')}>
                        {positiveQueryPredicates.map(p => <SelectOption key={p} value={p}>{queryPredicateTitles[p]}</SelectOption>)}
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
                                        form={form}
                                        namePrefix={[...namePrefix, 'blocks', blockFieldNumber]}
                                        dataset={dataset}
                                        showPredicate
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
                    style={{position: 'absolute', width: BTN_WIDTH, height: TOOLBAR_HEIGHT, top: 0, left: startBtnLeft + BTN_WIDTH*2 + H_SPACE*2}}
                    title={t('Remove Block')}
                    onClick={onRemove}
                >
                    -
                </Button>
            )}
        </div>
    )
}