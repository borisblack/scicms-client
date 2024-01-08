import {ReactNode} from 'react'
import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import {Tag, Typography} from 'antd'
import i18n from 'src/i18n'
import appConfig from 'src/config'
import {FieldType} from 'src/types'
import {NamedColumn} from './types'
import EditableCell from 'src/components/datagrid/EditableCell'
import SelectableCell from 'src/components/datagrid/SelectableCell'
import EditableNumberCell from 'src/components/datagrid/EditableNumberCell'
import CheckboxCell from 'src/components/datagrid/CheckboxCell'
import {AggregateType, Column} from 'src/types/bi'
import {getFormatOptions} from 'src/bi/util'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import FieldName from 'src/components/app/FieldName'
import ClickableCell from 'src/components/datagrid/ClickableCell'

interface GetColumnsProps {
    ownColumns: Record<string, Column>
    canEdit: boolean
    onClick: (fieldName: string) => void
    onChange: (value: NamedColumn, prevName: string) => void
}

const {Text} = Typography
const columnHelper = createColumnHelper<NamedColumn>()

const renderField = (field: NamedColumn, locked?: boolean): ReactNode => (
    <span>
        <FieldTypeIcon fieldType={field.type}/>
        &nbsp;
        <FieldName name={field.name} locked={locked}/>
    </span>
)

export function getColumns({ownColumns, canEdit, onChange, onClick}: GetColumnsProps): ColumnDef<NamedColumn, any>[] {
    return [
        columnHelper.accessor('name', {
            header: i18n.t('Name'),
            cell: info => {
                const thisField = info.row.original
                return canEdit /*&& thisField.custom*/ ? (
                    <ClickableCell
                        value={renderField(thisField, !thisField.custom)}
                        onClick={() => onClick(info.getValue())}
                    />
                ) : (
                    renderField(thisField, !thisField.custom)
                )
            },
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedColumn, string>,
        columnHelper.accessor('type', {
            header: i18n.t('Type'),
            cell: info => <Tag color="processing">{info.getValue()}</Tag>,
            size: 100,
            enableSorting: true
        }) as ColumnDef<NamedColumn, FieldType>,
        columnHelper.accessor('source', {
            header: i18n.t('Source'),
            cell: info => {
                const thisField = info.row.original
                const source = info.getValue()
                const sourceField = source ? ownColumns[source] : undefined
                return canEdit /*&& thisField.custom*/ ? (
                    <ClickableCell
                        value={sourceField ? renderField({...sourceField, name: source as string}) : null}
                        onClick={() => onClick(thisField.name)}
                    />
                ) : (
                    sourceField ? renderField({...sourceField, name: source as string}) : null
                )
            },
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedColumn, FieldType>,
        columnHelper.accessor('hidden', {
            header: i18n.t('Show'),
            cell: info => {
                return (
                    <CheckboxCell
                        value={!info.getValue()}
                        disabled={!canEdit}
                        onChange={visible => onChange({...info.row.original, hidden: !visible}, info.row.original.name)}
                    />
                )
            },
            size: 100,
            enableSorting: true
        }) as ColumnDef<NamedColumn, boolean>,
        columnHelper.accessor('aggregate', {
            header: i18n.t('Aggregate'),
            cell: info => {
                const thisField = info.row.original
                const value = info.getValue()
                return canEdit /*&& thisField.custom*/ ? (
                    <ClickableCell
                        value={value && <Text code>{value}</Text>}
                        onClick={() => onClick(thisField.name)}
                    />
                ) : (
                    value && <Text code>{info.getValue()}</Text>
                )
            },
            size: 180,
            enableSorting: true
        }) as ColumnDef<NamedColumn, AggregateType>,
        columnHelper.accessor('formula', {
            header: i18n.t('Formula'),
            cell: info => {
                const thisField = info.row.original
                const value = info.getValue()
                return canEdit /*&& thisField.custom*/ ? (
                    <ClickableCell
                        value={value && <Text code>{value}</Text>}
                        onClick={() => onClick(thisField.name)}
                    />
                ) : (
                    value && <Text code>{info.getValue()}</Text>
                )
            },
            size: 220,
            enableSorting: true
        }) as ColumnDef<NamedColumn, string>,
        columnHelper.accessor('format', {
            header: i18n.t('Format'),
            cell: info => {
                const {type} = info.row.original
                if (canEdit) {
                    return (
                        <SelectableCell
                            value={info.getValue()}
                            allowClear
                            options={getFormatOptions(type)}
                            onChange={format => onChange({...info.row.original, format}, info.row.original.name)}
                        />
                    )
                }

                return info.getValue()
            },
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedColumn, string>,
        columnHelper.accessor('alias', {
            header: i18n.t('Alias'),
            cell: info => canEdit ? (
                <EditableCell
                    value={info.getValue()}
                    onChange={alias => onChange({...info.row.original, alias}, info.row.original.name)}
                />
            ) : (
                info.getValue()
            ),
            size: 250,
            enableSorting: true
        }) as ColumnDef<NamedColumn, string>,
        columnHelper.accessor('colWidth', {
            header: i18n.t('Column Width'),
            cell: info => canEdit ? (
                <EditableNumberCell
                    value={info.getValue()}
                    min={0}
                    step={1}
                    onChange={colWidth => onChange({...info.row.original, colWidth}, info.row.original.name)}
                />
            ) : (
                info.getValue()
            ),
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedColumn, number>
    ]
}