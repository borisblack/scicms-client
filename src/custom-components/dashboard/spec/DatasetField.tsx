import _ from 'lodash'
import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {AutoComplete, Button, Col, Form, FormInstance, Row, Select} from 'antd'
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

interface OptionType {
    label: string
    value: string
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select
const MIN_SEARCH_LENGTH = 2
const DEBOUNCE_WAIT_INTERVAL = 500

export default function DatasetField({index, dataset, metricType, temporalType, onRemove}: Props) {
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const sortedItemNames = useMemo(() => itemService.getNames().sort(), [itemService])
    const [labelOptions, setLabelOptions] = useState<OptionType[]>([])
    const [metricOptions, setMetricOptions] = useState<OptionType[]>([])
    const [locationOptions, setLocationOptions] = useState<OptionType[]>([])
    const [temporalOptions, setTemporalOptions] = useState<OptionType[]>([])
    const [curItem, setCurItem] = useState<Item | null>(dataset.itemName ? itemService.getByName(dataset.itemName) : null)
    const attributes = curItem?.spec?.attributes

    const handleItemSelect = useCallback((name: string) => {
        setCurItem(itemService.getByName(name))
    }, [itemService])

    const labelAttrNames = useMemo(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return labelTypeSet.has(attr.type) && (attr.type !== AttrType.relation || (attr.relType !== RelType.oneToMany && attr.relType !== RelType.manyToMany))
            }
        )}, [attributes])

    const metricAttrNames = useMemo(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === metricType
            }
        )}, [attributes, metricType])

    const locationAttrNames = useMemo(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === AttrType.location
            }
        )}, [attributes])

    const temporalAttrNames = useMemo(
        () => {
            if (!attributes)
                return []

            return Object.keys(attributes).filter(attrName => {
                const attr = attributes[attrName]
                return attr.type === temporalType
            })
        }, [attributes, temporalType])

    const handleLabelSearch = _.debounce((value: string) => {
        setLabelOptions([])
        if (value.length < MIN_SEARCH_LENGTH)
            return

        const regExp = new RegExp(value, 'i')
        const labels = labelAttrNames.filter(it => it.match(regExp))
        setLabelOptions(labels.map(it => ({label: it, value: it})))
    }, DEBOUNCE_WAIT_INTERVAL)

    const handleMetricSearch = _.debounce((value: string) => {
        setMetricOptions([])
        if (value.length < MIN_SEARCH_LENGTH)
            return

        const regExp = new RegExp(value, 'i')
        const metrics = metricAttrNames.filter(it => it.match(regExp))
        setMetricOptions(metrics.map(it => ({label: it, value: it})))
    }, DEBOUNCE_WAIT_INTERVAL)

    const handleLocationSearch = _.debounce((value: string) => {
        setLocationOptions([])
        if (value.length < MIN_SEARCH_LENGTH)
            return

        const regExp = new RegExp(value, 'i')
        const locations = locationAttrNames.filter(it => it.match(regExp))
        setLocationOptions(locations.map(it => ({label: it, value: it})))
    }, DEBOUNCE_WAIT_INTERVAL)

    const handleTemporalSearch = _.debounce((value: string) => {
        setTemporalOptions([])
        if (value.length < MIN_SEARCH_LENGTH)
            return

        const regExp = new RegExp(value, 'i')
        const temporalList = temporalAttrNames.filter(it => it.match(regExp))
        setTemporalOptions(temporalList.map(it => ({label: it, value: it})))
    }, DEBOUNCE_WAIT_INTERVAL)

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
                        <AutoComplete options={labelOptions} placeholder={t('Label')} onSearch={handleLabelSearch}/>
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
                        <AutoComplete options={metricOptions} placeholder={t('Metric')} onSearch={handleMetricSearch}/>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['datasets', index, 'location']}
                        label={t('Location')}
                        initialValue={dataset.location}
                    >
                        <AutoComplete options={locationOptions} placeholder={t('Location')} onSearch={handleLocationSearch}/>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={['datasets', index, 'temporal']}
                        label={t('Temporal')}
                        initialValue={dataset.temporal}
                    >
                        <AutoComplete options={temporalOptions} placeholder={t('Temporal')} onSearch={handleTemporalSearch}/>
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