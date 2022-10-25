import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Col, Form, FormInstance, Row, Select} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'
import {AttrType, DashItem, Item, MetricType, RelType, TemporalType} from '../../../types'
import ItemService from '../../../services/item'
import styles from './DashboardSpec.module.css'

interface Props {
    form: FormInstance
    index: number
    item: DashItem
    metricType: MetricType
    temporalType?: TemporalType
    onRemove: () => void
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const numericTypes = [AttrType.int, AttrType.long, AttrType.float, AttrType.double, AttrType.decimal]
const temporalTypes = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
const labelTypes = [
    AttrType.uuid, AttrType.string, AttrType.text, AttrType.sequence, AttrType.email, AttrType.enum,
    ...numericTypes,
    ...temporalTypes,
    AttrType.bool, AttrType.media, AttrType.location, AttrType.relation
]
const labelTypeSet = new Set([...labelTypes])

export default function DashItemField({form, index, item, metricType, temporalType, onRemove}: Props) {
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const sortedItemNames = useMemo(() => itemService.getNames().sort(), [itemService])
    const [curItem, setCurItem] = useState<Item | null>(item.name ? itemService.getByName(item.name) : null)
    const attributes = curItem?.spec?.attributes

    const handleItemSelect = useCallback(async (name: string) => {
        await setCurItem(itemService.getByName(name))
    }, [itemService])

    const getLabelAttrNames = useCallback(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return labelTypeSet.has(attr.type) && (attr.type !== AttrType.relation || (attr.relType !== RelType.oneToMany && attr.relType !== RelType.manyToMany))
            }
        )}, [attributes])

    const getMetricAttrNames = useCallback(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === metricType
            }
        )}, [attributes, metricType])

    const getLocationAttrNames = useCallback(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === AttrType.location
            }
        )}, [attributes])

    const getTemporalAttrNames = useCallback(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === temporalType
            })
        }, [attributes, temporalType])

    return (
        <div className={styles.dashItemField}>
            <FormItem
                className={styles.formItem}
                name={['items', index, 'name']}
                label={t('Name')}
                initialValue={item.name}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Select onSelect={handleItemSelect}>
                    {sortedItemNames.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <Row gutter={16}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['items', index, 'label']}
                        label={t('Label')}
                        initialValue={item.label}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select>
                            {getLabelAttrNames().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['items', index, 'metric']}
                        label={t('Metric')}
                        initialValue={item.metric}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select>
                            {getMetricAttrNames().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['items', index, 'location']}
                        label={t('Location')}
                        initialValue={item.location}
                    >
                        <Select>
                            {getLocationAttrNames().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['items', index, 'temporal']}
                        label={t('Temporal')}
                        initialValue={item.temporal}
                    >
                        <Select>
                            {getTemporalAttrNames().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
            </Row>

            <Button
                type="primary"
                danger
                icon={<DeleteOutlined/>}
                style={{marginBottom: 16}}
                onClick={onRemove}
            >
                {t('Delete')}
            </Button>
        </div>
    )
}