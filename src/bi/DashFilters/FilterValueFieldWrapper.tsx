import {FC} from 'react'
import {FilterValueFieldProps} from './filterValueFields'
import {FieldType} from '../../types'
import StringFilterValueField from './filterValueFields/StringFilterValueField'
import {useTranslation} from 'react-i18next'
import {isBool, isNumeric, isString, isTemporal} from '../util'
import NumericFilterValueField from './filterValueFields/NumericFilterValueField'
import TemporalFilterValueField from './filterValueFields/TemporalFilterValueField'
import BoolFilterValueField from './filterValueFields/BoolFilterValueField'

function filterValueField(type: FieldType): FC<FilterValueFieldProps> {
    if (isString(type))
        return StringFilterValueField

    if (isNumeric(type))
        return NumericFilterValueField

    if (isTemporal(type))
        return TemporalFilterValueField

    if (isBool(type))
        return BoolFilterValueField

    return UnsupportedType
}

function UnsupportedType() {
    const {t} = useTranslation()

    return <span className="red">{t('Unsupported type')}</span>
}

export default function FilterValueFieldWrapper(props: FilterValueFieldProps) {
    const FilterValueFieldComponent = filterValueField(props.column.type)

    return <FilterValueFieldComponent {...props}/>
}