import {useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Button, Form, Input, Modal, Select, Tooltip, Transfer} from 'antd'
import {useTranslation} from 'react-i18next'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import PermissionService from '../../../services/permission'
import {Dash, DashboardSpec as IDashboardSpec, DashType} from '../../../types'
import './DashboardSpec.css'
import styles from './DashboardSpec.module.css'
import DashForm from './DashForm'
import {DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons'
import ItemService from '../../../services/item'
import {getDashIcon} from '../../../util/icons'

interface TransferRecord {
    key: string;
    title: string;
    description: string;
}

const COLS_COUNT = 12
const ROW_HEIGHT = 100
const DEFAULT_REFRESH_INTERVAL_SECONDS = 300
const DEFAULT_DASH_TYPE = DashType.bar

const ReactGridLayout = WidthProvider(RGL)
const {Option: SelectOption} = Select

const initialSpec: IDashboardSpec = {
    dashes: []
}

let tempId = 0

export default function DashboardSpec({me, item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionService])
    const [canEdit] = permissions
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const sortedItemNames = useMemo(() => itemService.getNames().sort(), [itemService])
    const [spec, setSpec] = useState<IDashboardSpec>(buffer.form.spec ?? {...(data?.spec ?? initialSpec)})
    const [activeDash, setActiveDash] = useState<Dash | null>(null)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    useEffect(() => {
        buffer.form.spec = spec
    }, [buffer.form, spec])

    function handleDashAdd() {
        setSpec(prevSpec => {
            const {dashes} = prevSpec
            const id = (++tempId).toString()
            return {
                dashes: [
                    {
                        name: id,
                        displayName: id,
                        type: DEFAULT_DASH_TYPE,
                        x: 0,
                        y: 0,
                        w: COLS_COUNT / 2,
                        h: 1,
                        refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
                        items: []
                    },
                    ...dashes
                ]
            }
        })
    }

    function handleLayoutChange(layouts: Layout[]) {
        setSpec(prevSpec => ({
            dashes: layouts.map((it, i) => {
                const curDash = prevSpec.dashes[i]
                return {
                    name: it.i,
                    displayName: it.i,
                    type: curDash?.type ?? DEFAULT_DASH_TYPE,
                    x: it.x,
                    y: it.y,
                    w: it.w,
                    h: it.h,
                    refreshIntervalSeconds: curDash?.refreshIntervalSeconds ?? DEFAULT_REFRESH_INTERVAL_SECONDS,
                    items: curDash?.items ?? []
                }
            })
        }))
    }

    function selectDash(dash: Dash) {
        setActiveDash(dash)
    }

    function openDash(dash: Dash) {
        // setActiveDash(dash)
        setDashModalVisible(true)
        dashForm.resetFields()
    }

    function removeDash(name: string) {
        if (name === activeDash?.name) {
            setDashModalVisible(false)
            setActiveDash(null)
        }

        setSpec(prevSpec => ({
            dashes: prevSpec.dashes.filter(it => it.name !== name)
        }))
    }

    function handleDashFormFinish(values: any) {
        if (!canEdit || !activeDash)
            return

        const {name, displayName, type, refreshIntervalSeconds} = values
        const dashToUpdate: Dash = {
            ...activeDash,
            name,
            displayName,
            type,
            refreshIntervalSeconds
        }

        setSpec(prevSpec => ({
            dashes: prevSpec.dashes.map(it => it.name === activeDash.name ? dashToUpdate : it)
        }))

        setDashModalVisible(false)
        setActiveDash(null)
    }

    function renderDash(dash: Dash) {
        const Icon = getDashIcon(dash.type)
        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash?.name === dash.name ? styles.activeDash : ''}`}
                onClick={() => selectDash(dash)}
                onDoubleClick={() => openDash(dash)}
            >
                <Icon/>&nbsp;{dash.name}
            </div>
        )
    }

    function handleItemAdd(name: string) {
        if (!activeDash)
            return

        setActiveDash(prevActiveDash => ({
            ...prevActiveDash as Dash,
            items: [...prevActiveDash?.items ?? [], {name, attributes: []}]
        }))
    }

    function handleActiveDashItemSelect(index: number, name: string) {
        setActiveDash(prevActiveDash => ({
            ...prevActiveDash,
            items: (prevActiveDash?.items ?? []).map((it, i) => i === index ? {name, attributes: []} : it)
        } as Dash))
    }

    function handleActiveDashItemRemove(index: number, name: string) {
        if (!activeDash)
            return

        setActiveDash(prevActiveDash => ({
            ...prevActiveDash as Dash,
            items: (prevActiveDash?.items ?? []).filter((it, i) => it.name !== name || i !== index)
        }))
    }

    function getTransferDataSource(itemName: string): TransferRecord[] {
        const item = itemService.getByName(itemName)
        const {attributes} = item.spec
        return Object.keys(attributes).sort().map(attrName => {
            const attr = attributes[attrName]
            return {
                key: attrName,
                title: attrName,
                description: attr.description ?? attrName
            }
        })
    }

    function handleTransferChange(index: number, nextTargetKeys: string[]) {
        if (!activeDash)
            return

        setActiveDash(prevActiveDash => ({
            ...prevActiveDash as Dash,
            items: (prevActiveDash?.items ?? []).map((it, i) => {
                if (i === index)
                    return {...it, attributes: nextTargetKeys}

                return it
            })
        }))
    }

    const layout = spec.dashes.map(it => ({
        i: it.name,
        x: it.x,
        y: it.y,
        w: it.w,
        h: it.h
    }))

    return (
        <>
            <Button type="dashed" onClick={handleDashAdd}>{t('Add Dash')}</Button>
            {spec.dashes.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={layout}
                    cols={COLS_COUNT}
                    rowHeight={ROW_HEIGHT}
                    isDraggable={canEdit}
                    isDroppable={canEdit}
                    isResizable={canEdit}
                    onLayoutChange={handleLayoutChange}
                >
                    {spec.dashes.map(it => renderDash(it))}
                </ReactGridLayout>
            )}

            <Modal
                title={activeDash?.name}
                visible={isDashModalVisible}
                destroyOnClose
                onOk={() => dashForm.submit()}
                onCancel={() => setDashModalVisible(false)}
            >
                {activeDash && (
                    <>
                        <DashForm form={dashForm} dash={activeDash} canEdit={canEdit} onFormFinish={handleDashFormFinish}/>

                        <h4>{t('Items')}</h4>
                        {activeDash.items.map((item, i) => (
                            <div key={`${item.name}${i}`}>
                                <Select
                                    style={{width: 300, marginBottom: 8}}
                                    size="small"
                                    value={item.name}
                                    onSelect={(name: string) => handleActiveDashItemSelect(i, name)}
                                >
                                    {sortedItemNames.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                                </Select>
                                <Tooltip title={t('Delete')}>
                                    <Button
                                        type="link"
                                        className="red"
                                        icon={<DeleteOutlined/>}
                                        disabled={!canEdit}
                                        onClick={() => handleActiveDashItemRemove(i, item.name)}
                                    />
                                </Tooltip>

                                <Transfer
                                    dataSource={getTransferDataSource(item.name)}
                                    targetKeys={item.attributes}
                                    style={{marginBottom: 16}}
                                    render={it => it.title}
                                    onChange={(nextTargetKeys: string[]) => handleTransferChange(i, nextTargetKeys)}
                                />

                                {/*<Input*/}
                                {/*    style={{width: 300, marginTop: 8, marginBottom: 16}}*/}
                                {/*    size="small"*/}
                                {/*    placeholder={t('Composite attribute')}*/}
                                {/*    disabled={!canEdit}*/}
                                {/*/>*/}
                                {/*<Tooltip title={t('Add')}>*/}
                                {/*    <Button*/}
                                {/*        type="link"*/}
                                {/*        size="small"*/}
                                {/*        style={{marginLeft: 4}}*/}
                                {/*        icon={<PlusCircleOutlined/>}*/}
                                {/*        disabled={!canEdit}*/}
                                {/*        // onClick={() => handleActiveDashItemAttributeAdd(i, item.name)}*/}
                                {/*    />*/}
                                {/*</Tooltip>*/}
                            </div>
                        ))}

                        <Button type="primary" style={{marginBottom: 16}} icon={<PlusCircleOutlined/>} disabled={!canEdit} onClick={() => handleItemAdd(sortedItemNames[0])}>
                            {t('Add Item')}
                        </Button>
                        <br/>
                        <Button type="primary" danger icon={<DeleteOutlined/>} disabled={!canEdit} onClick={() => removeDash(activeDash.name)}>
                            {t('Remove Dash')}
                        </Button>
                    </>
                )}
            </Modal>
        </>
    )
}