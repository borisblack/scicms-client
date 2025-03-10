import {getParser} from '../extensions/functions'
import {notifyErrorThrottled} from '../util'
import i18n from '../i18n'
import {CSSProperties, ReactNode} from 'react'
import IconSuspense from '../uiKit/icons/IconSuspense'

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
const ICON_REGEXP = /^(\w+)(?:-([#\w]+))?$/

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
  if (color != null) style.color = color

  if (icon == null) {
    if (bgColor != null) style.backgroundColor = bgColor

    if (fontStyle != null) style.fontStyle = fontStyle

    if (fontSize != null) style.fontSize = fontSize

    if (fontWeight != null) style.fontWeight = fontWeight
  }

  return style
}

export function parseRules(rules?: string): FieldRule[] {
  const parsedRules = (rules?.split('\n') ?? [])
    .map(r => r.trim())
    .map(r => r.replace(/;$/, '')) // trailing semicolon
    .filter(r => r !== '')
    .filter(r => !r.startsWith('#')) // comment
    .map(r => r.match(RULE_REGEXP))
    .filter(Boolean)
    .map(mg => {
      const matchGroups = mg as RegExpMatchArray
      return {
        condition: matchGroups[1]?.trim(),
        items: parseRuleItems(matchGroups[2] as string)
      }
    })
  // console.log('Parsed rules', parsedRules)

  return parsedRules
}

function parseRuleItems(ruleItems: string): FieldProps[] {
  const parsedRules = ruleItems
    .split(';')
    .map(r => r.replace(/\s*/g, ''))
    .map(r => r.match(RULE_ITEM_REGEXP))
    .filter(Boolean)
    .map(mg => {
      const ruleItemMatchGroups = mg as RegExpMatchArray
      const field = ruleItemMatchGroups[1] as string
      const prop = ruleItemMatchGroups[2] as string
      const value = ruleItemMatchGroups[3] as string

      let iconMatchGroups: RegExpMatchArray | null
      if (prop === 'icon' && (iconMatchGroups = value.match(ICON_REGEXP)) != null) {
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

export function renderField(
  fieldRules: FieldRule[],
  fieldName: string,
  value: any,
  record: Record<string, any>
): ReactNode {
  let iconProps: FieldProps | null = null
  for (const rule of fieldRules) {
    if (rule.condition == null || evaluateExpression(rule.condition, record)) {
      for (const ruleItem of rule.items) {
        if ((ruleItem.field === fieldName || ruleItem.field === '*') && ruleItem.icon != null) iconProps = ruleItem
      }
    }
  }

  if (iconProps != null) {
    return (
      <div>
        <IconSuspense iconName={iconProps.icon} style={toStyle(iconProps)} />
        &nbsp;
        {value}
      </div>
    )
  }

  return value
}

export function getFieldStyle(fieldRules: FieldRule[], fieldName: string, record: Record<string, any>): CSSProperties {
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

export function getFieldColor(fieldRules: FieldRule[], record: Record<string, any>): string | undefined {
  let fieldColor: string | undefined = undefined
  for (const rule of fieldRules) {
    if (rule.condition == null || evaluateExpression(rule.condition, record)) {
      fieldColor = rule.items
        .map(i => i.color)
        .filter(c => !!c)
        .reduce((prev, cur) => cur, fieldColor)
    }
  }

  return fieldColor
}

export function getSeriesColors(
  fieldRules: FieldRule[],
  fieldName: string,
  seriesData: Record<string, any>[],
  defaultColors: string[] | undefined
): string[] | undefined {
  const isDefaultColorsEmpty = defaultColors == null || defaultColors.length === 0
  const colors = seriesData
    .map((rec, i) => {
      const color = getFieldColor(fieldRules, rec)

      return color ?? (isDefaultColorsEmpty ? undefined : defaultColors[i % defaultColors.length])
    })
    .filter(c => c != null)

  return colors.length === 0 ? undefined : (colors as string[])
}
