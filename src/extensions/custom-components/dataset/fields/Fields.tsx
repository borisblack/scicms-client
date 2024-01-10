import _ from 'lodash'
import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Space, Typography} from 'antd'
import {PlusCircleOutlined} from '@ant-design/icons'

import {Split} from 'src/components/Split'
import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DATASET_ITEM_NAME} from 'src/config/constants'
import DataGrid, {DataWithPagination, RequestParams} from 'src/components/datagrid/DataGrid'
import appConfig from 'src/config'
import {getInitialData, processLocal} from 'src/util/datagrid'
import {Column, Dataset, DatasetSpec} from 'src/types/bi'
import {NamedColumn} from 'src/types/bi'
import {getColumns} from './fields-datagrid'
import {useAcl} from 'src/util/hooks'
import DataPreview from './DataPreview'
import FieldModal from './FieldModal'

const MIN_TOP_PANE_SIZE = 400
const MIN_BOTTOM_PANE_SIZE = 400

const {Title} = Typography
const splitConfig = appConfig.ui.split

const toNamedFields = (fields: Record<string, Column>): NamedColumn[] =>
    Object.keys(fields).map(colName => ({name: colName, ...fields[colName]}))

let customColumnCounter: number = 0

export default function Fields({data: dataWrapper, buffer, onBufferChange}: CustomComponentRenderContext) {
    const data = dataWrapper.data as Dataset | undefined
    const {item} = dataWrapper
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? {}, [buffer])
    const allFields = useMemo(() => spec.columns ?? {}, [spec])
    const ownFields = useMemo(() => _.pickBy(allFields, col => !col.custom), [allFields])
    const [namedFields, setNamedFields] = useState(toNamedFields(allFields))
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const [openFieldModal, setOpenFieldModal] = useState<boolean>(false)
    const [currentField, setCurrentField] = useState<NamedColumn | undefined>()
    const isNew = !data?.id

    useEffect(() => {
        const newSpec = data?.spec ?? {} as Partial<DatasetSpec>
        setNamedFields(toNamedFields(newSpec.columns ?? {}))
        onBufferChange({
            spec: newSpec
        })
    }, [data])

    useEffect(() => {
        setVersion(prevVersion => prevVersion + 1)
    }, [namedFields])

    if (isNew)
        return null

    const handleRequest = (params: RequestParams) => {
        setFilteredData(
            processLocal(namedFields, params)
        )
    }

    function handleFieldChange(updatedField: NamedColumn, prevName: string) {
        if (!acl.canWrite)
            return

        const newNamedFields =
            allFields.hasOwnProperty(prevName) ? namedFields.map(f => f.name === prevName ? updatedField : f) : [updatedField, ...namedFields]

        setNamedFields(newNamedFields)

        const newFields: Record<string, Column> = {}
        for (const nc of newNamedFields) {
            const newField: any = {...nc}
            newFields[nc.name] = newField
            delete newField.name
        }

        onBufferChange({
            ...buffer,
            spec: {
                ...spec,
                columns: newFields
            }
        })
    }

    function createDraft() {
        const ownColNames = Object.keys(ownFields).sort()
        if (ownColNames.length === 0)
            return

        const firstOwnColName = ownColNames[0]
        const firstOwnColumn = ownFields[firstOwnColName]
        const newField: NamedColumn = {
            name: `${firstOwnColName}${++customColumnCounter}`,
            type: firstOwnColumn.type,
            custom: true,
            source: firstOwnColName,
            aggregate: undefined,
            formula: undefined,
            hidden: false,
            alias: undefined,
            format: undefined,
            colWidth: undefined
        }
        setCurrentField(newField)
        setOpenFieldModal(true)
    }

    function handleFieldEdit(fieldName: string) {
        if (!allFields.hasOwnProperty(fieldName))
            throw new Error(`Field [${fieldName}] not found`)

        const field = allFields[fieldName]
        setCurrentField({...field, name: fieldName})
        setOpenFieldModal(true)
    }

    const renderToolbar = () => (
        <Space size={10}>
            <Title level={5} style={{display: 'inline'}}>{t('Fields')}</Title>
            {acl.canWrite && !_.isEmpty(ownFields) && (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusCircleOutlined/>}
                    onClick={createDraft}
                >
                    {t('Add')}
                </Button>
            )}
        </Space>
    )

    const gridColumns = getColumns({
        ownColumns: ownFields,
        canEdit: acl.canWrite,
        onClick: handleFieldEdit,
        onChange: handleFieldChange
    })

    return (
        <>
            <Split
                horizontal
                minPrimarySize={`${MIN_TOP_PANE_SIZE}px`}
                initialPrimarySize={`${MIN_TOP_PANE_SIZE}px`}
                minSecondarySize={`${MIN_BOTTOM_PANE_SIZE}px`}
                defaultSplitterColors={splitConfig.defaultSplitterColors}
                splitterSize={splitConfig.splitterSize}
                resetOnDoubleClick
            >
                <div style={{height: MIN_TOP_PANE_SIZE}}>
                    <DataGrid
                        columns={gridColumns}
                        data={filteredData}
                        initialState={{
                            hiddenColumns: [],
                            pageSize: appConfig.query.defaultPageSize
                        }}
                        title={t('Fields')}
                        height={MIN_TOP_PANE_SIZE}
                        toolbar={renderToolbar()}
                        version={version}
                        getRowId={(row: NamedColumn) => row.name}
                        onRequest={handleRequest}
                    />
                </div>

                <div style={{padding: 16}}>
                    <DataPreview
                        dataset={data}
                        allFields={allFields}
                        height={MIN_BOTTOM_PANE_SIZE}
                    />
                </div>
            </Split>

            {currentField && (
                <FieldModal
                    field={currentField}
                    allFields={allFields}
                    open={openFieldModal}
                    canEdit={acl.canWrite}
                    onChange={handleFieldChange}
                    onClose={() => setOpenFieldModal(false)}
                />
            )}
        </>
    )
}