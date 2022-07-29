import {Column} from '@tanstack/react-table'
import {AttrType} from '../../../types'
import DateColumnFilter from './DateColumnFilter'
import DefaultColumnFilter from './DefaultColumnFilter'

interface Props {
    column: Column<any, unknown>
}

export default function ColumnFilter({column}: Props) {
    const type = column.columnDef.meta?.type

    return (type === AttrType.date || type === AttrType.datetime || type === AttrType.time) ?
        <DateColumnFilter column={column}/> : <DefaultColumnFilter column={column}/>
}