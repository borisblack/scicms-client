import {CSSProperties, ReactNode, useMemo} from 'react'
import {Alert, Table} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {ColumnsType} from 'antd/es/table'
import {DashRenderContext} from '..'
import {getParser} from '../../functions'

interface ReportDashOpts {
    displayedColNames: string[]
    rules?: string
    keyColName?: string
}

interface CellRule {
    condition?: string
    items: CellProps[]
}

interface CellProps {
    field: string
    color?: string
    bgColor?: string
    fontStyle?: string
    fontWeight?: string
    icon?: string
}

const RULE_REGEXP = /^(?:(.+)\?)?(.+)$/
const RULE_ITEM_REGEXP = /^(\w+)\.(\w+)=([-\w]+)$/
const ICON_REGEXP = /^(\w+)(?:-(\w+))?$/

function parseRules(rules?: string): CellRule[] {
    return (rules?.split('\n') ?? [])
        .map(r => r.replace(/\s*/g, ''))
        .map(r => r.replace(/;$/, ''))
        .filter(r => r !== '')
        .filter(r => !r.startsWith('#'))
        .filter(r => r.match(RULE_REGEXP))
        .map(r => {
            const matchGroups = r.match(RULE_REGEXP) as RegExpMatchArray
            return {
                condition: matchGroups[1],
                items: parseRuleItems(matchGroups[2] as string)
            }
        })
}

function parseRuleItems(ruleItems: string): CellProps[] {
    return ruleItems.split(';')
        .filter(r => r.match(RULE_ITEM_REGEXP))
        .map(r => {
            const ruleItemMatchGroups = r.match(RULE_ITEM_REGEXP) as RegExpMatchArray
            const field = ruleItemMatchGroups[1] as string
            const prop = ruleItemMatchGroups[2] as string
            const value = ruleItemMatchGroups[3] as string
            if (prop === 'icon') {
                const iconMatchGroups = value.match(ICON_REGEXP) as RegExpMatchArray
                return {
                    field,
                    icon: iconMatchGroups[1],
                    color: iconMatchGroups[2]
                }
            } else {
                return {
                    field,
                    [prop]: value
                }
            }
        })
}

function evalCondition(condition: string, values: Record<string, any>): boolean {
    const expr = getParser().parse(condition)
    return expr.evaluate(values)
}

export default function ReportDash({dataset, dash, height, fullScreen, data}: DashRenderContext) {
    const {displayedColNames, rules, keyColName} = dash.optValues as ReportDashOpts
    const cellRules = useMemo(() => parseRules(rules), [rules])
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
                    render: (value, record, rowIndex) => renderCell(cn, value, record, rowIndex),
                    onCell: (record, rowIndex) => ({style: getCellStyle(cn, record, rowIndex)})
                }
            })

    function renderCell(colName: string, value: any, record: any, rowIndex: number): ReactNode {
        let iconProps: CellProps | null = null
        for (const rule of cellRules) {
            if (rule.condition == null || evalCondition(rule.condition, record)) {
                for (const ruleItem of rule.items) {
                    if (ruleItem.field === colName && ruleItem.icon != null)
                        iconProps = ruleItem
                }
            }
        }

        return iconProps == null ? value : <div>{value}</div>
    }

    function getCellStyle(colName: string, record: any, rowIndex?: number): CSSProperties {
        return {
            backgroundColor: 'red'
        }
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