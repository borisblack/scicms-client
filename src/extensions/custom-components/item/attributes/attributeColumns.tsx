import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import {Checkbox, Tag} from 'antd'

import i18n from 'src/i18n'
import appConfig from 'src/config'
import {FieldType} from 'src/types'
import {RelType} from 'src/types/schema'
import {NamedAttribute} from './types'
import {ReactNode} from 'react'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import FieldName, {TagType} from 'src/components/app/FieldName'

const renderAttribute = (attribute: NamedAttribute, tag?: TagType): ReactNode => (
    <span>
        <FieldTypeIcon fieldType={attribute.type}/>
        &nbsp;
        <FieldName name={attribute.name} tag={tag}/>
    </span>
)

const columnHelper = createColumnHelper<NamedAttribute>()

export const getAttributeColumns = (core: boolean): ColumnDef<NamedAttribute, any>[] =>
    [
        columnHelper.accessor('name', {
            header: i18n.t('Name'),
            cell: info => renderAttribute(info.row.original, core ? 'lock' : undefined),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('type', {
            header: i18n.t('Type'),
            cell: info => <Tag color="processing">{info.getValue()}</Tag>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, FieldType>,
        columnHelper.accessor('columnName', {
            header: i18n.t('Column Name'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('displayName', {
            header: i18n.t('Display Name'),
            cell: info => info.getValue(),
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('description', {
            header: i18n.t('Description'),
            cell: info => info.getValue(),
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('enumSet', {
            header: i18n.t('Enum Set'),
            cell: info => info.getValue() ? info.getValue()?.join(', ') : null,
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string[]>,
        columnHelper.accessor('seqName', {
            header: i18n.t('Sequence Name'),
            cell: info => info.getValue(),
            size: 210,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('confirm', {
            header: i18n.t('Confirm'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('encode', {
            header: i18n.t('Encode'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('relType', {
            header: i18n.t('Relation Type'),
            cell: info => info.getValue() ? <Tag>{info.getValue()}</Tag> : null,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, RelType>,
        columnHelper.accessor('target', {
            header: i18n.t('Target Item'),
            cell: info => info.getValue(),
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('intermediate', {
            header: i18n.t('Intermediate Item'),
            cell: info => info.getValue(),
            size: 210,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('mappedBy', {
            header: i18n.t('Mapped By'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('inversedBy', {
            header: i18n.t('Inversed By'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('required', {
            header: i18n.t('Required'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('defaultValue', {
            header: i18n.t('Default Value'),
            cell: info => info.getValue(),
            size: 180,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('keyed', {
            header: i18n.t('Keyed'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('unique', {
            header: i18n.t('Unique'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('indexed', {
            header: i18n.t('Indexed'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('private', {
            header: i18n.t('Private'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('readOnly', {
            header: i18n.t('Read Only'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('pattern', {
            header: i18n.t('Pattern'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('length', {
            header: i18n.t('Length'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('precision', {
            header: i18n.t('Precision'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('scale', {
            header: i18n.t('Scale'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('minRange', {
            header: i18n.t('Min Range'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('maxRange', {
            header: i18n.t('Max Range'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('colHidden', {
            header: i18n.t('Column Hidden'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 170,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('colWidth', {
            header: i18n.t('Column Width'),
            cell: info => info.getValue(),
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('fieldHidden', {
            header: i18n.t('Field Hidden'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 140,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('fieldWidth', {
            header: i18n.t('Field Width'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>
    ]

export const getHiddenAttributeColumns = () => ['enumSet', 'seqName', 'confirm', 'encode', 'relType', 'target', 'intermediate', 'mappedBy', 'inversedBy', 'keyed']