import {Button, FormInstance, Space, Tooltip} from 'antd'
import {Dataset, IDash, IDashFilter, QueryOp, QueryPredicate} from '../../../../types'
import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BsBraces, BsPlus, BsPlusLg} from 'react-icons/bs'
import styles from './DashFilters.module.css'

interface Props {
    dataset: Dataset
    dash: IDash
    form: FormInstance
}

const allOps: QueryOp[] = Object.keys(QueryOp) as QueryOp[]
const groupFilterKeys = new Set<string>([QueryPredicate.$and, QueryPredicate.$or, QueryPredicate.$not])

export default function DashFilters({dataset, dash, form}: Props) {
    const {t} = useTranslation()
    const allColumns: string[] = useMemo(() => Object.keys(dataset.spec.columns), [dataset.spec.columns])
    const initialColumnOps = useCallback((): {[name: string]: QueryOp[]} => {
        const res: {[name: string]: QueryOp[]} = {}
        for (const col of allColumns) {
            res[col] = [...allOps]
        }
        return res
    }, [allColumns])
    const [availableColumnOps, setAvailableColumnOps] = useState<{[name: string]: QueryOp[]}>(initialColumnOps())
    const [filters, setFilters] = useState<IDashFilter[]>(dash.defaultFilters ?? [])

    return (
        <>
            <Space>
                <Tooltip title={t('Add Filter')}>
                    <Button size="small"><BsPlus className={styles.btnIcon}/></Button>
                </Tooltip>
                <Tooltip title={t('Add Block')}>
                    <Button size="small"><BsPlus className={styles.btnIcon}/><BsBraces className={styles.btnIcon}/></Button>
                </Tooltip>
            </Space>
            {filters.map(filter => {
                const {columnName, op} = filter
                return (
                    <div key={`${columnName}#${op}`}>{`${columnName}#${op}`}</div>
                )
            })}
        </>
    )
}