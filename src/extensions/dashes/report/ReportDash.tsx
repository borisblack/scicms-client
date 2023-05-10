import {ReactNode, useMemo} from 'react'
import {Alert, Table} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {ColumnsType} from 'antd/es/table'
import {DashRenderContext} from '..'
import {columnType, formatValue} from '../../../util/bi'
import RulesService from '../../../services/rules'

interface ReportDashOpts {
    displayedColNames: string[]
    keyColName?: string
    rules?: string
}

const rulesService = RulesService.getInstance()

export default function ReportDash({dataset, dash, height, fullScreen, data}: DashRenderContext) {
    const {displayedColNames, rules, keyColName} = dash.optValues as ReportDashOpts
    const cellRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const datasetColumns = dataset.spec.columns ?? {}
    const columns: ColumnsType<any> =
        displayedColNames
            .filter(cn => cn in datasetColumns)
            .map(cn => {
                const datasetColumn = datasetColumns[cn]
                return {
                    key: cn,
                    dataIndex: cn,
                    title: datasetColumn.alias ?? cn,
                    width: datasetColumn.colWidth as string | number | undefined,
                    render: (value, record) => renderCell(cn, value, record),
                    onCell: record => ({style: rulesService.getFieldStyle(cellRules, cn, record)})
                }
            })

    function renderCell(colName: string, value: any, record: Record<string, any>): ReactNode {
        const formattedValue = formatValue(value, columnType(datasetColumns[colName]))

        return rulesService.renderField(cellRules, colName, formattedValue, record)
    }

    if (columns.length !== displayedColNames.length)
        return <Alert message="Invalid columns specification" type="error"/>

    return (
        <Table
            size="small"
            columns={columns}
            dataSource={data}
            rowKey={keyColName ? keyColName : () => uuidv4()}
            pagination={false}
            scroll={{y: fullScreen ? '80vh' : height - 100}}
        />
    )
}