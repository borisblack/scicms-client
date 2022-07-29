import {Attribute, AttrType} from '../../../types'
import DateColumnFilter from './filters/DateColumnFilter'
import DefaultColumnFilter from './filters/DefaultColumnFilter'

interface Props {
    attribute: Attribute,
    filterValue: any,
    onFilterChange: (value: any) => void
    onFilterSubmit: () => void
}

export default function ColumnTitle({attribute, filterValue, onFilterChange, onFilterSubmit}: Props) {
    const {type, displayName} = attribute

    return (
        <div>
            <div>{displayName}</div>
            <div style={{marginTop: 2}}>
                {(type === AttrType.date || type === AttrType.datetime || type === AttrType.time) ?
                    <DateColumnFilter value={filterValue} onChange={onFilterChange} onSubmit={onFilterSubmit}/> :
                    <DefaultColumnFilter value={filterValue} onChange={onFilterChange} onSubmit={onFilterSubmit}/>
                }
            </div>
        </div>
    )
}