import _ from 'lodash'
import {ChangeEvent, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Input, Pagination, Space, Spin, Tree, Typography} from 'antd'
import type {DataNode} from 'antd/es/tree'
import {Split} from 'src/components/split/Split'
import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DATASET_ITEM_NAME, MAIN_DATASOURCE_NAME} from 'src/config/constants'
import {Pagination as IPagination} from 'src/types'
import {Dataset, DatasetSources, DatasetSpec, Table} from 'src/types/bi'
import {loadDatasourceTables} from 'src/services/datasource'
import appConfig from 'src/config'
import {useAcl} from 'src/util/hooks'
import TableItem from './TableItem'
import SourcesConstructor from './SourcesConstructor'
import styles from './Sources.module.css'
import {FieldTypeIcon} from 'src/util/icons'

const DEBOUNCE_WAIT_INTERVAL = 500

const {Search} = Input
const {Text} = Typography

const defaultPagination: IPagination = {
    pageSize: appConfig.query.defaultPageSize,
    total: 0
}

const initialSources: DatasetSources = {
    joinedTables: []
}

export default function Sources({data: dataWrapper, buffer, onBufferChange}: CustomComponentRenderContext) {
    const {item, data} = dataWrapper
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const {datasource} = (data ?? {}) as Partial<Dataset>
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer, data])
    const sources: DatasetSources = useMemo(() => spec.sources ?? initialSources, [spec])
    const [loading, setLoading] = useState<boolean>(false)
    const [tables, setTables] = useState<Table[]>([])
    const [q, setQ] = useState<string>()
    const [pagination, setPagination] = useState<IPagination>(defaultPagination)
    const isNew = !data?.id

    useEffect(() => {
        onBufferChange({
            spec: data?.spec ?? {}
        })
    }, [data])

    useEffect(() => {
        setLoading(true)
        loadDatasourceTables(datasource?.data?.name ?? MAIN_DATASOURCE_NAME, {q, pagination})
            .then(res => {
                setTables(res.data)

                if (res.meta.pagination != null)
                    setPagination(res.meta.pagination)
            })
            .finally(() => setLoading(false))
    }, [datasource?.data?.name, q, pagination.page, pagination.pageSize, pagination.total])

    if (isNew)
        return null

    const handleFilter = _.debounce(async (e: ChangeEvent<HTMLInputElement>) => {
        setQ(e.target.value)
    }, DEBOUNCE_WAIT_INTERVAL)

    const handlePaginationChange =
        (page: number, pageSize: number) => setPagination(prevPagination => ({...prevPagination, page, pageSize}))

    function handleSourcesChange(newSources: DatasetSources) {
        onBufferChange({
            ...buffer,
            spec: {
                ...spec,
                sources: newSources
            }
        })
    }

    const treeData: DataNode[] = tables.map(table => ({
        key: table.name,
        title: (
            <TableItem
                table={table}
                strong={table.name === sources.mainTable?.name || sources.joinedTables.findIndex(t => t.name === table.name) >= 0}
                canEdit={acl.canWrite}
            />
        ),
        children: Object.keys(table.columns).map(key => ({
            key: `${table.name}_${key}`,
            title: (
                <Space>
                    <FieldTypeIcon fieldType={table.columns[key].type}/>
                    <Text>{key}</Text>
                </Space>
            )
        }))
    }))

    return (
        <Spin spinning={loading}>
            <Split
                initialPrimarySize="400px"
                minPrimarySize="300px"
                defaultSplitterColors={{color: '#dddddd', hover: '#cccccc', drag: '#cccccc'}}
                resetOnDoubleClick
                splitterSize="2px"
            >
                <div className={styles.tablesPane}>
                    <div className={styles.filterInput}>
                        <Search
                            allowClear
                            placeholder={t('Source name')} size="small"
                            onChange={handleFilter}
                        />
                    </div>

                    <Tree
                        // switcherIcon={<DownOutlined/>}
                        treeData={treeData}
                    />

                    <div className={styles.pagination}>
                        <Pagination
                            current={pagination.page}
                            defaultPageSize={appConfig.query.defaultPageSize}
                            pageSize={pagination.pageSize}
                            pageSizeOptions={['10', '20', '50', '100']}
                            showSizeChanger
                            showQuickJumper
                            showTotal={total => `${t('Total records')}: ${total}`}
                            size="small"
                            total={pagination.total}
                            onChange={handlePaginationChange}
                            onShowSizeChange={handlePaginationChange}
                        />
                    </div>
                </div>

                <SourcesConstructor sources={sources} canEdit={acl.canWrite} onChange={handleSourcesChange}/>
            </Split>
        </Spin>
    )
}