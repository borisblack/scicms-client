import {getParser} from '../extensions/functions'
import {notifyErrorThrottled} from '../util'
import i18n from '../i18n'
import {CSSProperties, ReactNode} from 'react'
import {allIcons} from '../util/icons'
import {parseDashColor} from '../util/bi'

export interface FieldRule {
    condition?: string
    items: FieldProps[]
}

export interface FieldProps {
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

function evaluateExpression(condition: string, values: Record<string, any>): any {
    try {
        const expr = getParser().parse(condition)
        return expr.evaluate(values)
    } catch (e: any) {
        notifyErrorThrottled(i18n.t('Expression evaluation error'), e.message)
        return false
    }
}

function toStyle(props: FieldProps): CSSProperties {
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

export default class RulesService {
    private static instance: RulesService | null = null

    static getInstance() {
        if (!RulesService.instance)
            RulesService.instance = new RulesService()

        return RulesService.instance
    }

    parseRules(rules?: string): FieldRule[] {
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
                    items: this.parseRuleItems(matchGroups[2] as string)
                }
            })
        // console.log('Parsed rules', parsedRules)

        return parsedRules
    }

    private parseRuleItems(ruleItems: string): FieldProps[] {
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

    renderField(fieldRules: FieldRule[], fieldName: string, value: any, record: Record<string, any>): ReactNode {
        let iconProps: FieldProps | null = null
        for (const rule of fieldRules) {
            if (rule.condition == null || evaluateExpression(rule.condition, record)) {
                for (const ruleItem of rule.items) {
                    if ((ruleItem.field === fieldName || ruleItem.field === '*') && ruleItem.icon != null)
                        iconProps = ruleItem
                }
            }
        }

        if (iconProps != null) {
            const Icon = allIcons[iconProps.icon as string]

            return <div>{Icon && <Icon style={toStyle(iconProps)}/>}&nbsp;{value}</div>
        }

        return value
    }

    getFieldStyle(fieldRules: FieldRule[], fieldName: string, record: Record<string, any>): CSSProperties {
        const fieldStyle: CSSProperties = {}
        for (const rule of fieldRules) {
            if (rule.condition == null || evaluateExpression(rule.condition, record)) {
                for (const ruleItem of rule.items) {
                    if ((ruleItem.field === fieldName || ruleItem.field === '*') && ruleItem.icon == null) {
                        Object.assign(fieldStyle, toStyle(ruleItem))
                    }
                }
            }
        }

        return fieldStyle
    }

    getFieldColor(fieldRules: FieldRule[], fieldName: string, record: Record<string, any>): string | undefined {
        const defaultColor = parseDashColor(true)
        let fieldColor: string | undefined = undefined
        for (const rule of fieldRules) {
            if (rule.condition == null || evaluateExpression(rule.condition, record)) {
                fieldColor = rule.items.map(i => i.color)
                    .filter(c => !!c)
                    .reduce((prev, cur) => cur, fieldColor)
            }
        }

        return fieldColor ?? (defaultColor as string | undefined)
    }
}