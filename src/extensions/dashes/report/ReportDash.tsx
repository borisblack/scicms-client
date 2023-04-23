import {Alert, Table} from 'antd'
import {DashRenderContext} from '../index'
import {ColumnsType} from 'antd/es/table'

interface ReportDashOpts {
    keyColName: string
    displayedColNames: string[]
}

export default function ReportDash({dataset, dash, height, fullScreen, data}: DashRenderContext) {
    const {displayedColNames} = dash.optValues as ReportDashOpts
    const datasetColumns = dataset.spec.columns ?? {}
    const columns: ColumnsType<any> =
        displayedColNames
            .filter(cn => cn in datasetColumns)
            .map(cn => {
                const datasetColumn = datasetColumns[cn]
                return {key: cn, dataIndex: cn, title: datasetColumn.alias ?? cn}
            })

    if (columns.length !== displayedColNames.length)
        return <Alert message="Invalid columns specification" type="error"/>

    return (
        <Table
            size="small"
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{y: fullScreen ? '80vh' : height - 100}}
        />
    )
}