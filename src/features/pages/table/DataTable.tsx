import {Table} from 'antd'
import {ColumnProps} from 'antd/lib/table'

import {Item} from '../../../types'
import ColumnTitle from './ColumnTitle'
import './DataTable.css'
import {useState} from 'react'

interface Props {
    item: Item
}

export default function DataTable({item}: Props) {
    const [filters, setFilters] = useState({} as {[name: string]: any})

    function getColumns() {
        const columns = []
        for (const attrName in item.spec.attributes) {
            if (!item.spec.attributes.hasOwnProperty(attrName))
                continue

            const attribute = item.spec.attributes[attrName]
            const column: ColumnProps<any> = {
                key: attrName,
                dataIndex: attrName,
                title: (
                    <ColumnTitle
                        attribute={attribute}
                        filterValue={filters[attrName]}
                        onFilterChange={(value: any) => handleFilterChange(attrName, value)}
                        onFilterSubmit={handleFilterSubmit}
                    />
                ),
                ellipsis: true,
                sorter: true,
                width: attribute.width
            }

            columns.push(column)
        }

        return columns
    }

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }))
    }

    const handleFilterSubmit = () => {
        console.log('Filter submit')
    }

    return <Table
        columns={getColumns()}
        scroll={{x: true}}
        size="small"
    />
}