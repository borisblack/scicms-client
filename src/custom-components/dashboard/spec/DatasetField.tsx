import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Col, Form, FormInstance, Row, Select} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'
import {AttrType, Dataset, Item, MetricType, RelType, TemporalType} from '../../../types'
import ItemService from '../../../services/item'
import styles from './DashboardSpec.module.css'
import {labelTypeSet} from '../../../util/dashboard'

interface Props {
    form: FormInstance
    index: number
    dataset: Dataset
    metricType: MetricType
    temporalType?: TemporalType
    onRemove: () => void
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DatasetField({index, dataset, metricType, temporalType, onRemove}: Props) {
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const sortedItemNames = useMemo(() => itemService.getNames().sort(), [itemService])
    const [curItem, setCurItem] = useState<Item | null>(dataset.itemName ? itemService.getByName(dataset.itemName) : null)
    const attributes = curItem?.spec?.attributes

    const handleItemSelect = useCallback((name: string) => {
        setCurItem(itemService.getByName(name))
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
                name={['datasets', index, 'itemName']}
                label={t('Item')}
                initialValue={dataset.itemName}
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
                        name={['datasets', index, 'label']}
                        label={t('Label')}
                        initialValue={dataset.label}
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
                        name={['datasets', index, 'metric']}
                        label={t('Metric')}
                        initialValue={dataset.metric}
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
                        name={['datasets', index, 'location']}
                        label={t('Location')}
                        initialValue={dataset.location}
                    >
                        <Select>
                            {getLocationAttrNames().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['datasets', index, 'temporal']}
                        label={t('Temporal')}
                        initialValue={dataset.temporal}
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