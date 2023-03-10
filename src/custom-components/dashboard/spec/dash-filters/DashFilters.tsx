import {Button, FormInstance, Space, Tooltip} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {Column, DashFiltersBlock, Dataset, IDash, IDashFilter, QueryOp, QueryPredicate} from '../../../../types'
import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {defaultDashFiltersBlock, queryOps} from '../../../../util/dashboard'

interface Props {
    dataset: Dataset
    dash: IDash
    form: FormInstance
}

export default function DashFilters({dataset, dash, form}: Props) {
    const {t} = useTranslation()
    const allColumns: {[name: string]: Column} = useMemo(() => dataset.spec.columns ?? {}, [dataset.spec.columns])
    const sortedColNames: string[] = useMemo(() => Object.keys(allColumns).sort(), [allColumns])
    const initialColOps = useCallback((): {[name: string]: QueryOp[]} => {
        const res: {[name: string]: QueryOp[]} = {}
        for (const colName of sortedColNames) {
            const col = allColumns[colName]
            res[colName] = queryOps(col.type)
        }
        return res
    }, [allColumns, sortedColNames])
    const [availableColOps, setAvailableColOps] = useState<{[name: string]: QueryOp[]}>(initialColOps())
    const [filters, setFilters] = useState<DashFiltersBlock>(dash.defaultFilters ?? {...defaultDashFiltersBlock})

    const handleFilterAdd = useCallback(() => {
        if (sortedColNames.length === 0)
            throw new Error('Illegal state')

        const colName = sortedColNames[0]
        const availableOps = availableColOps[colName] // TODO: If empty go to next column
        const op = availableOps[0]

        const newFilter: IDashFilter = {
            id: uuidv4(),
            columnName: colName,
            op,
            show: false
        }

        setFilters(prevFilters => ({
            ...prevFilters,
            filters: [
                ...prevFilters.filters,
                newFilter
            ]
        }))

        setAvailableColOps(prevAvailableColOps => ({
            ...prevAvailableColOps,
            [colName]: availableOps.filter(o => o !== op)
        }))
    }, [availableColOps, sortedColNames])

    const handleBlockAdd = useCallback(() => {
        const newBlock: DashFiltersBlock = {
            id: uuidv4(),
            predicate: QueryPredicate.$and,
            filters: [],
            blocks: []
        }

        setFilters(prevFilters => ({
            ...prevFilters,
            blocks: [
                ...prevFilters.blocks,
                newBlock
            ]
        }))
    }, [])

    const handleFilterRemove = useCallback((id: string) => {
        const filterToRemove = filters.filters.find(f => f.id === id)
        if (filterToRemove == null)
            throw new Error('Illegal state')

        // Remove filter
        setFilters(prevFilters => ({
            ...prevFilters,
            filters: prevFilters.filters.filter(f => f.id !== id)
        }))

        // Restore query operators for column
        const colName = filterToRemove.columnName
        const column = allColumns[colName]
        const allOps = queryOps(column.type)
        const availableOpSet = new Set(availableColOps[colName])
        const newAvailableOps: QueryOp[] = allOps.filter(op => availableOpSet.has(op) || op === filterToRemove.op)
        setAvailableColOps(prevAvailableColOps => ({
            ...prevAvailableColOps,
            [colName]: newAvailableOps
        }))
    }, [allColumns, availableColOps, filters.filters])

    const handleBlockRemove = useCallback((id: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            blocks: prevFilters.blocks.filter(b => b.id !== id)
        }))
    }, [])

    return (
        <>
            <Space>
                <Tooltip title={t('Add Filter')}>
                    <Button onClick={handleFilterAdd} disabled={sortedColNames.length === 0}>+</Button>
                </Tooltip>
                <Tooltip title={t('Add Block')}>
                    <Button onClick={handleBlockAdd}>{'+ { }'}</Button>
                </Tooltip>
            </Space>
            {filters.filters.map(filter => {
                const {columnName, op} = filter

                return (
                    <div key={`${columnName}#${op}`}>{`${columnName}#${op}`}</div>
                )
            })}

            {filters.blocks.map((block, i) => {
                const {predicate} = block

                return (
                    <div key={`${predicate}#${i}`}>{`${predicate}#${i}`}</div>
                )
            })}
        </>
    )
}