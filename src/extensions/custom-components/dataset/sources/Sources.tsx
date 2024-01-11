import _ from 'lodash'
import {ChangeEvent, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Input, Pagination, Spin, Tree, Typography} from 'antd'
import type {DataNode} from 'antd/es/tree'
import {CheckboxChangeEvent} from 'antd/es/checkbox'

import {Split} from 'src/components/Split'
import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DATASET_ITEM_NAME, MAIN_DATASOURCE_NAME} from 'src/config/constants'
import {Pagination as IPagination} from 'src/types'
import {Dataset, DatasetSources, DatasetSpec, Table} from 'src/types/bi'
import {loadDatasourceTables} from 'src/services/datasource'
import appConfig from 'src/config'
import {useAcl} from 'src/util/hooks'
import TableItem from './TableItem'
import SourcesDesigner from './SourcesDesigner'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import {SourcesQueryBuildResult} from './SourcesQueryBuilder'
import CodeEditor from 'src/components/Editor'
import {EditorMode} from 'src/components/Editor/constants'
import styles from './Sources.module.css'

const MIN_LEFT_PANE_SIZE = '600px'
const MIN_RIGHT_PANE_SIZE = '700px'
const MIN_TOP_PANE_SIZE = '250px'
const MIN_BOTTOM_PANE_SIZE = '250px'
const DEBOUNCE_WAIT_INTERVAL = 500

const {Search} = Input
const {Text} = Typography

const splitConfig = appConfig.ui.split
const defaultPagination: IPagination = {
    pageSize: appConfig.query.defaultPageSize,
    total: 0
}

const initialSources: DatasetSources = {
    joinedTables: []
}

export default function Sources({data: dataWrapper, buffer, onBufferChange}: CustomComponentRenderContext) {
    const data = dataWrapper.data as Dataset | undefined
    const {item} = dataWrapper
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const datasource = data?.datasource
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? {}, [buffer])
    const sources: DatasetSources = useMemo(() => spec.sources ?? initialSources, [spec])
    const [loading, setLoading] = useState<boolean>(false)
    const [tables, setTables] = useState<Table[]>([])
    const [q, setQ] = useState<string>()
    const [pagination, setPagination] = useState<IPagination>(defaultPagination)
    const editorValue = useMemo(() => buffer.tableName ? `SELECT * FROM ${buffer.tableName}` : (buffer.query ?? ''), [buffer.query, buffer.tableName])
    const useDesigner: boolean = useMemo(() => spec.useDesigner ?? !editorValue, [editorValue, spec.useDesigner])
    const isNew = !data?.id

    useEffect(() => {
        onBufferChange({
            tableName: data?.tableName,
            query: data?.query,
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

    function handleSourcesChange(newSources: DatasetSources, buildResult: SourcesQueryBuildResult) {
        onBufferChange({
            ...buffer,
            tableName: buildResult.tableName,
            query: buildResult.query,
            spec: {
                ...spec,
                sources: newSources
            }
        })
    }

    const handleUseDesignerCheck = (e: CheckboxChangeEvent) =>
        onBufferChange({
            ...buffer,
            spec: {
                ...spec,
                // sources: e.target.checked ? spec.sources : initialSources,
                useDesigner: e.target.checked
            }
        })

    function handleEditorValueChange(value: string) {
        if (value === editorValue)
            return

        onBufferChange({
            ...buffer,
            tableName: undefined,
            query: value
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
        children: Object.keys(table.columns).map(key => {
            const column = table.columns[key]
            return {
                key: `${table.name}_${key}`,
                title: (
                    <span>
                        <FieldTypeIcon fieldType={column.type}/>
                        &nbsp;&nbsp;
                        <Text>{key}</Text>
                    </span>
                ),
                // style: {height: 26}
            }
        })
    }))

    return (
        <Spin spinning={loading}>
            <Split
                minPrimarySize={MIN_LEFT_PANE_SIZE}
                initialPrimarySize={MIN_LEFT_PANE_SIZE}
                minSecondarySize={MIN_RIGHT_PANE_SIZE}
                defaultSplitterColors={splitConfig.defaultSplitterColors}
                splitterSize={splitConfig.splitterSize}
                resetOnDoubleClick
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
                        className={styles.tablesTree}
                        selectable={false}
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

                <div>
                    <Checkbox
                        className={styles.useDesignerCheckbox}
                        disabled={!acl.canWrite}
                        checked={useDesigner}
                        onChange={handleUseDesignerCheck}
                    >
                        <Text strong>{t('Use designer')}</Text>
                    </Checkbox>

                    <Split
                        horizontal
                        minPrimarySize={MIN_TOP_PANE_SIZE}
                        initialPrimarySize={MIN_TOP_PANE_SIZE}
                        minSecondarySize={MIN_BOTTOM_PANE_SIZE}
                        defaultSplitterColors={splitConfig.defaultSplitterColors}
                        splitterSize={splitConfig.splitterSize}
                        resetOnDoubleClick
                    >
                        <SourcesDesigner
                            sources={sources}
                            canEdit={acl.canWrite && useDesigner}
                            onChange={handleSourcesChange}
                        />
                        <div>
                            <CodeEditor
                                value={editorValue}
                                mode={EditorMode.SQL}
                                height={MIN_BOTTOM_PANE_SIZE}
                                lineNumbers
                                canEdit={acl.canWrite && !useDesigner}
                                onChange={handleEditorValueChange}
                            />
                        </div>
                    </Split>
                </div>
            </Split>
        </Spin>
    )
}