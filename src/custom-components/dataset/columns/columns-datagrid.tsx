import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import i18n from '../../../i18n'
import appConfig from '../../../config'
import {Tag} from 'antd'
import {Column, FieldType} from '../../../types'
import EditableCell from '../../../components/datagrid/EditableCell'

export interface NamedColumn extends Column {
    name: string
}

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
    columnHelper.accessor('alias', {
        header: i18n.t('Alias'),
        cell: info => canEdit ? <EditableCell value={info.getValue()} onChange={alias => onChange({...info.row.original, alias})}/> : info.getValue(),
        size: 250,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>
]