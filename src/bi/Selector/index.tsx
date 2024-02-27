import _ from 'lodash'
import {useTranslation} from 'react-i18next'
import {Button, Dropdown, Form, Space} from 'antd'
import {ClearOutlined, DeleteOutlined, EditOutlined, SettingOutlined} from '@ant-design/icons'
import {PageHeader} from '@ant-design/pro-layout'

import {Dataset, IDash, ISelector} from 'src/types/bi'
import {useModal} from 'src/util/hooks'
import SelectorModal from '../SelectorModal'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import styles from './Selector.module.css'
import SelectorValue, {SelectorValueFormValues} from './SelectorValue'
import {fromFormSelectorFilter, toFormSelectorFilter} from '../util'

interface SelectorProps {
    selector: ISelector
    height: number
    datasetMap: Record<string, Dataset>
    dashes: IDash[]
    canEdit: boolean
    readOnly: boolean
    onLockChange: (locked: boolean) => void
    onChange: (text: ISelector) => void
    onDelete: () => void
}

export default function Selector({selector, height, datasetMap, dashes, canEdit, readOnly, onLockChange, onChange, onDelete}: SelectorProps) {
    const {t} = useTranslation()
    const [selectorValueForm] = Form.useForm()
    const {show: showSelectorModal, close: closeSelectorModal, modalProps: selectorModalProps} = useModal()

    function handleSelectorModalOpen() {
        onLockChange(true)
        showSelectorModal()
    }

    function handleSelectorModalClose() {
        onLockChange(false)
        closeSelectorModal()
    }

    function handleSelectorValueFormFinish(values: SelectorValueFormValues) {
        const filter = fromFormSelectorFilter(values.selectorFilter)
        onChange({
            ...selector,
            value: filter.value
        })
    }

    function handleSelectorClear() {
        onChange(_.omit(selector, 'value'))
    }

    const getSettingsMenuItems = (): ItemType[] => {
        const menuItems: ItemType[] = []

        if (!readOnly) {
            menuItems.push(
                /*{
                    type: 'divider'
                },*/
                {
                    key: 'edit',
                    label: <Space><EditOutlined/>{t('Edit')}</Space>,
                    onClick: handleSelectorModalOpen
                },
                {
                    key: 'delete',
                    label: <Space><DeleteOutlined className="red"/>{t('Delete')}</Space>,
                    disabled: !canEdit,
                    onClick: onDelete
                }
            )
        }

        return menuItems
    }

    return (
        <>
            <PageHeader
                className={styles.pageHeader}
                title={selector.name}
                // footer={''}
                extra={[
                    <Button
                        key="clear"
                        type="text"
                        className={styles.toolbarBtn}
                        icon={<ClearOutlined/>}
                        title={t('Clear')}
                        onClick={handleSelectorClear}
                        onMouseDown={e => e.stopPropagation()}
                    />,
                    <Dropdown
                        key="settings"
                        placement="bottomRight"
                        trigger={['click']}
                        menu={{items: getSettingsMenuItems()}}
                    >
                        <Button
                            type="text"
                            className={styles.toolbarBtn}
                            icon={<SettingOutlined/>}
                            title={t('Settings')}
                            onMouseDown={e => e.stopPropagation()}
                        />
                    </Dropdown>
                ]}
            />

            <Form
                form={selectorValueForm}
                size="small"
                layout="vertical"
                initialValues={{selectorFilter: toFormSelectorFilter(selector)}}
                onFinish={handleSelectorValueFormFinish}
            >
                <SelectorValue
                    namePrefix={['selectorFilter']}
                    selector={selector}
                    datasetMap={datasetMap}
                />
            </Form>

            <SelectorModal
                {...selectorModalProps}
                selector={selector}
                datasetMap={datasetMap}
                dashes={dashes}
                canEdit={canEdit}
                onChange={onChange}
                onClose={handleSelectorModalClose}
            />
        </>
    )
}