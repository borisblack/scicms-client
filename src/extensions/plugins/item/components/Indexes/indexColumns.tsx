import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import {Checkbox} from 'antd'
import i18n from 'src/i18n'
import {NamedIndex} from './types'

const columnHelper = createColumnHelper<NamedIndex>()

export const getIndexColumns = (defaultColWidth: number): ColumnDef<NamedIndex, any>[] =>
  [
        columnHelper.accessor('name', {
          header: i18n.t('Name'),
          cell: info => info.getValue(),
          size: 250,
          enableSorting: true
        }) as ColumnDef<NamedIndex, string>,
        columnHelper.accessor('columns', {
          header: i18n.t('Columns'),
          cell: info => info.getValue() ? info.getValue().join(', ') : null,
          size: 250,
          enableSorting: true
        }) as ColumnDef<NamedIndex, string[]>,
        columnHelper.accessor('unique', {
          header: i18n.t('Unique'),
          cell: info => <Checkbox checked={info.getValue()}/>,
          size: defaultColWidth,
          enableSorting: true
        }) as ColumnDef<NamedIndex, boolean>
  ]

export const getHiddenIndexColumns = () => []