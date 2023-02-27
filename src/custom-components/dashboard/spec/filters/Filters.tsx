import {FormInstance} from 'antd'
import {DatasetFiltersInput, IDash} from '../../../../types'
import {useState} from 'react'

interface Props {
    form: FormInstance
    dash: IDash
}

const groupFilterKeys = new Set(['$and', '$or', '$not'])

export default function Filters({form, dash}: Props) {
    const [filters, setFilters] = useState<DatasetFiltersInput<any>>(dash.defaultFilters ?? {})

    return Object.keys(filters)
        .filter(k => !groupFilterKeys.has(k))
        .map(k => {
            const filter = filters[k]
            return (
                <div key={k}></div>
            )
        })
}