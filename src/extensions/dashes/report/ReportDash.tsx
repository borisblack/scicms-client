import {ReactNode, useMemo} from 'react'
import {Alert, Table} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {ColumnsType} from 'antd/es/table'
import {DashRenderContext} from '..'
import {columnType, formatValue} from 'src/bi/util'
import * as RulesService from 'src/services/rules'
import {useBiProperties} from 'src/bi/util/hooks'

interface ReportDashOpts {
    displayedColNames: string[]
    keyColName?: string
    rules?: string
}

const TABLE_HEADER_HEIGHT = 40

function ReportDash({dataset, dash, height, fullScreen, data}: DashRenderContext) {
  const optValues = dash.optValues as ReportDashOpts
  const {displayedColNames, rules} = optValues
  const keyColName = Array.isArray(optValues.keyColName) ? optValues.keyColName[0] : optValues.keyColName
  const cellRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const allColumns = {...(dataset.spec.columns ?? {}), ...dash.fields}
  const columns: ColumnsType<any> =
        displayedColNames
          .filter(cn => cn in allColumns)
          .map(cn => {
            const datasetColumn = allColumns[cn]
            return {
              key: cn,
              dataIndex: cn,
              title: datasetColumn.alias ?? cn,
              width: datasetColumn.colWidth as string | number | undefined,
              render: (value, record) => renderCell(cn, value, record),
              onCell: record => ({style: RulesService.getFieldStyle(cellRules, cn, record)})
            }
          })

  const biProps = useBiProperties()
  const {dateFormatString, timeFormatString, dateTimeFormatString} = biProps.dateTime
  const {fractionDigits} = biProps

  function renderCell(colName: string, value: any, record: Record<string, any>): ReactNode {
    const formattedValue = formatValue({value, type: columnType(allColumns[colName]), dateFormatString, timeFormatString, dateTimeFormatString, fractionDigits})

    return RulesService.renderField(cellRules, colName, formattedValue, record)
  }

  if (columns.length !== displayedColNames.length)
    return <Alert message="Invalid columns specification" type="error"/>

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={data}
      rowKey={/*keyColName ? keyColName :*/ () => uuidv4()}
      pagination={false}
      scroll={{y: fullScreen ? '80vh' : height - TABLE_HEADER_HEIGHT}}
    />
  )
}

export default ReportDash