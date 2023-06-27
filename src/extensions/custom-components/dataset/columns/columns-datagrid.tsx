import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import i18n from '../../../../i18n'
import appConfig from '../../../../config'
import {Tag} from 'antd'
import {FieldType, NamedColumn} from '../../../../types'
import EditableCell from '../../../../components/datagrid/EditableCell'
import SelectableCell from '../../../../components/datagrid/SelectableCell'
import EditableNumberCell from '../../../../components/datagrid/EditableNumberCell'

const numberFormatOptions = [
    {label: 'int', value: 'int'},
    {label: 'float', value: 'float'}
]

const dateTimeFormatOptions = [
    {label: 'date', value: 'date'},
    {label: 'time', value: 'time'},
    {label: 'datetime', value: 'datetime'}
]

const columnHelper = createColumnHelper<NamedColumn>()
export const getColumns = (canEdit: boolean, onChange: (value: NamedColumn) => void): ColumnDef<NamedColumn, any>[] => [
    columnHelper.accessor('name', {
        header: i18n.t('Name'),
        cell: info => info.getValue(),
        size: appConfig.ui.dataGrid.colWidth,
        enableSorting: true
    }) as ColumnDef<NamedColumn, string>,
    columnHelper.accessor('type', {
        header: i18n.t('Type'),
        cell: info => <Tag color="processing">{info.getValue()}</Tag>,
        size: appConfig.ui.dataGrid.colWidth,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>,
    columnHelper.accessor('format', {
        header: i18n.t('Format'),
        cell: info => {
            const {type} = info.row.original
            if (canEdit) {
                if (type === FieldType.float || type === FieldType.double || type === FieldType.decimal)
                    return (
                        <SelectableCell
                            value={info.getValue()}
                            options={numberFormatOptions}
                            onChange={format => onChange({...info.row.original, format})}
                        />
                    )

                if (type === FieldType.datetime || type === FieldType.timestamp)
                    return (
                        <SelectableCell
                            value={info.getValue()}
                            options={dateTimeFormatOptions}
                            onChange={format => onChange({...info.row.original, format})}
                        />
                    )
            }

            return info.getValue()
        },
        size: appConfig.ui.dataGrid.colWidth,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>,
    columnHelper.accessor('alias', {
        header: i18n.t('Alias'),
        cell: info => canEdit ? <EditableCell value={info.getValue()} onChange={alias => onChange({...info.row.original, alias})}/> : info.getValue(),
        size: 250,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>,
    columnHelper.accessor('colWidth', {
        header: i18n.t('Column Width'),
        cell: info => canEdit ? <EditableNumberCell value={info.getValue()} min={0} step={1} onChange={colWidth => onChange({...info.row.original, colWidth})}/> : info.getValue(),
        size: 160,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>
]