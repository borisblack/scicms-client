import _ from 'lodash'
import {ChangeEvent, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form, FormInstance, Input, Pagination, Space, Spin, Tree, Typography} from 'antd'
import type {DataNode} from 'antd/es/tree'
import {CheckboxChangeEvent} from 'antd/es/checkbox'

import {Split} from 'src/uiKit/Split'
import {DATASET_ITEM_NAME, MAIN_DATASOURCE_NAME} from 'src/config/constants'
import {Pagination as IPagination} from 'src/types'
import {Dataset, DatasetSources, DatasetSpec, Table} from 'src/types/bi'
import {findDatasourceById, loadDatasourceTables} from 'src/services/datasource'
import {useAcl, useAppProperties} from 'src/util/hooks'
import TableItem from './TableItem'
import SourcesDesigner from './SourcesDesigner'
import FieldTypeIcon from 'src/components/FieldTypeIcon/FieldTypeIcon'
import {SourcesQueryBuildResult} from './SourcesQueryBuilder'
import CodeEditor from 'src/uiKit/Editor'
import {EditorMode} from 'src/uiKit/Editor/constants'
import styles from './Sources.module.css'
import {CustomComponentContext} from 'src/extensions/plugins/types'
import {Datasource, DatasourceType} from 'src/types/schema'

const MIN_LEFT_PANE_SIZE = '600px'
const MIN_RIGHT_PANE_SIZE = '700px'
const MIN_TOP_PANE_SIZE = '250px'
const MIN_BOTTOM_PANE_SIZE = '250px'
const DEBOUNCE_WAIT_INTERVAL = 500

const {Search} = Input
const {Text} = Typography

const initialSources: DatasetSources = {
  mainTable: null,
  joinedTables: []
}

export function Sources({form, itemTab: dataWrapper, getValue, onBufferChange}: CustomComponentContext) {
  const data = dataWrapper.data as Dataset | undefined
  const {item} = dataWrapper
  if (item.name !== DATASET_ITEM_NAME) throw new Error('Illegal argument')

  const {t} = useTranslation()
  const appProps = useAppProperties()
  const acl = useAcl(item, data)
  const datasourceId = Form.useWatch('datasource.id', form as FormInstance)
  const datasourceName = Form.useWatch('datasource', form as FormInstance)
  const [datasource, setDatasource] = useState<Datasource | undefined>()
  const isDatabase = datasource?.sourceType === DatasourceType.DATABASE
  const spec: DatasetSpec = useMemo(() => getValue('spec', {columns: {}}), [getValue])
  const sources: DatasetSources = useMemo(() => spec.sources ?? initialSources, [spec])
  const [loading, setLoading] = useState<boolean>(false)
  const [tables, setTables] = useState<Table[]>([])
  const [schema, setSchema] = useState<string>()
  const [q, setQ] = useState<string>()
  const splitConfig = appProps.ui.split
  const defaultPagination: IPagination = {
    pageSize: appProps.query.defaultPageSize,
    total: 0
  }
  const [pagination, setPagination] = useState<IPagination>(defaultPagination)
  const editorValue = useMemo(() => {
    const tableName = getValue('tableName')
    return tableName ? `SELECT * FROM ${tableName}` : getValue('query', '')
  }, [getValue])
  const useDesigner: boolean = useMemo(
    () => spec.useDesigner ?? false /*!editorValue*/,
    [/*editorValue,*/ spec.useDesigner]
  )

  useEffect(() => {
    setLoading(true)
    loadDatasourceTables(datasourceName ?? MAIN_DATASOURCE_NAME, {schema, q, pagination})
      .then(res => {
        setTables(res.data)

        if (res.meta.pagination != null) setPagination(res.meta.pagination)
      })
      .finally(() => setLoading(false))
  }, [datasourceName, schema, q, pagination.page, pagination.pageSize, pagination.total])

  useEffect(() => {
    if (!datasourceId) return

    setLoading(true)
    findDatasourceById(datasourceId)
      .then(setDatasource)
      .finally(() => setLoading(false))
  }, [datasourceId])

  const handleSchemaChange = _.debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setSchema(e.target.value)
  }, DEBOUNCE_WAIT_INTERVAL)

  const handleFilterChange = _.debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value)
  }, DEBOUNCE_WAIT_INTERVAL)

  const handlePaginationChange = (page: number, pageSize: number) =>
    setPagination(prevPagination => ({...prevPagination, page, pageSize}))

  function handleSourcesChange(newSources: DatasetSources, buildResult: SourcesQueryBuildResult) {
    onBufferChange({
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
      spec: {
        ...spec,
        // sources: e.target.checked ? spec.sources : initialSources,
        useDesigner: e.target.checked
      }
    })

  function handleEditorValueChange(value: string) {
    if (value === editorValue) return

    onBufferChange({
      tableName: null,
      query: value
    })
  }

  const treeData: DataNode[] = tables.map(table => ({
    key: table.name,
    title: (
      <TableItem
        table={table}
        strong={
          table.name === sources.mainTable?.name || sources.joinedTables.findIndex(t => t.name === table.name) >= 0
        }
        canEdit={acl.canWrite}
      />
    ),
    children: Object.entries(table.columns).map(([fieldName, field]) => ({
      key: `${table.name}_${fieldName}`,
      title: (
        <span className="text-ellipsis">
          <FieldTypeIcon fieldType={field.type} />
          &nbsp;&nbsp;
          {fieldName}
        </span>
      )
      // style: {height: 26}
    }))
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
          <Space.Compact className={styles.filterInput} size="small">
            <Input allowClear placeholder={t('Schema')} onChange={handleSchemaChange} />
            <Search allowClear placeholder={t('Source name')} onChange={handleFilterChange} />
          </Space.Compact>

          <Tree
            className={styles.tablesTree}
            selectable={false}
            // switcherIcon={<DownOutlined/>}
            treeData={treeData}
          />

          <div className={styles.pagination}>
            <Pagination
              current={pagination.page}
              defaultPageSize={appProps.query.defaultPageSize}
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
            checked={useDesigner || !isDatabase}
            onChange={handleUseDesignerCheck}
          >
            <Text strong>{t('Use designer')}</Text>
          </Checkbox>

          {isDatabase ? (
            <Split
              horizontal
              minPrimarySize={MIN_TOP_PANE_SIZE}
              initialPrimarySize={MIN_TOP_PANE_SIZE}
              minSecondarySize={MIN_BOTTOM_PANE_SIZE}
              defaultSplitterColors={splitConfig.defaultSplitterColors}
              splitterSize={splitConfig.splitterSize}
              resetOnDoubleClick
            >
              <SourcesDesigner sources={sources} canEdit={acl.canWrite && useDesigner} onChange={handleSourcesChange} />
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
          ) : (
            <SourcesDesigner sources={sources} canEdit={acl.canWrite} isSingleTable onChange={handleSourcesChange} />
          )}
        </div>
      </Split>
    </Spin>
  )
}
