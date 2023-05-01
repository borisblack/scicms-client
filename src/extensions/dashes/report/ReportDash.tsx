import {CSSProperties, ReactNode, useMemo} from 'react'
import {Alert, Table} from 'antd'
import {v4 as uuidv4} from 'uuid'
import {ColumnsType} from 'antd/es/table'
import {DashRenderContext} from '..'
import {getParser} from '../../functions'
import {allIcons} from '../../../util/icons'
import i18n from '../../../i18n'
import {columnType, formatValue} from '../../../util/bi'
import {TemporalType} from '../../../types'
import {notifyErrorThrottled} from '../../../util'

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
    icon?: string
    color?: string
    bgColor?: string
    fontSize?: string
    fontStyle?: string
    fontWeight?: string
}

const RULE_REGEXP = /^(?:(.+)\?)?(.+)$/
const RULE_ITEM_REGEXP = /^([*\w]+)\.(\w+)=([-#\w]+)$/
const ICON_REGEXP = /^(\w+)(?:-(\w+))?$/

function parseRules(rules?: string): CellRule[] {
    const parsedRules = (rules?.split('\n') ?? [])
        .map(r => r.trim())
        .map(r => r.replace(/;$/, ''))
        .filter(r => r !== '')
        .filter(r => !r.startsWith('#'))
        .filter(r => r.match(RULE_REGEXP))
        .map(r => {
            const matchGroups = r.match(RULE_REGEXP) as RegExpMatchArray
            return {
                condition: matchGroups[1]?.trim(),
                items: parseRuleItems(matchGroups[2] as string)
            }
        })
    // console.log('Parsed rules', parsedRules)

    return parsedRules
}

function parseRuleItems(ruleItems: string): CellProps[] {
    const parsedRules = ruleItems.split(';')
        .map(r => r.replace(/\s*/g, ''))
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
    // console.log('Parsed rule items', parsedRules)

    return parsedRules
}

function evaluateExpression(condition: string, values: Record<string, any>): any {
    try {
        const expr = getParser().parse(condition)
        return expr.evaluate(values)
    } catch (e: any) {
        notifyErrorThrottled(i18n.t('Expression evaluation error'), e.message)
        return false
    }
}

function toStyle(props: CellProps): CSSProperties {
    const {icon, color, bgColor, fontSize, fontStyle, fontWeight} = props
    const style: CSSProperties = {}
    if (color != null)
        style.color = color

    if (icon == null) {
        if (bgColor != null)
            style.backgroundColor = bgColor

        if (fontStyle != null)
            style.fontStyle = fontStyle

        if (fontSize != null)
            style.fontSize = fontSize

        if (fontWeight != null)
            style.fontWeight = fontWeight
    }

    return style
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
                    width: datasetColumn.colWidth as string | number | undefined,
                    render: (value, record, rowIndex) => renderCell(cn, value, record, rowIndex),
                    onCell: (record, rowIndex) => ({style: getCellStyle(cn, record, rowIndex)})
                }
            })

    function renderCell(colName: string, value: any, record: any, rowIndex: number): ReactNode {
        const formattedValue = formatValue(value, columnType(datasetColumns[colName]) as TemporalType)
        let iconProps: CellProps | null = null
        for (const rule of cellRules) {
            if (rule.condition == null || evaluateExpression(rule.condition, record)) {
                for (const ruleItem of rule.items) {
                    if ((ruleItem.field === colName || ruleItem.field === '*') && ruleItem.icon != null)
                        iconProps = ruleItem
                }
            }
        }

        if (iconProps != null) {
            const Icon = allIcons[iconProps.icon as string]

            return <div>{Icon && <Icon style={toStyle(iconProps)}/>}&nbsp;{formattedValue}</div>
        }

        return formattedValue
    }

    function getCellStyle(colName: string, record: any, rowIndex?: number): CSSProperties {
        const cellStyle: CSSProperties = {}
        for (const rule of cellRules) {
            if (rule.condition == null || evaluateExpression(rule.condition, record)) {
                for (const ruleItem of rule.items) {
                    if ((ruleItem.field === colName || ruleItem.field === '*') && ruleItem.icon == null) {
                        Object.assign(cellStyle, toStyle(ruleItem))
                    }
                }
            }
        }

        return cellStyle
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