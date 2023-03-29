import {FC} from 'react'
import {FilterValueFieldProps} from './filter-value-fields'
import {FieldType} from '../../types'
import StringFilterValueField from './filter-value-fields/StringFilterValueField'
import {useTranslation} from 'react-i18next'
import {isBool, isNumeric, isString, isTemporal} from '../../util/bi'
import NumericFilterValueField from './filter-value-fields/NumericFilterValueField'
import TemporalFilterValueField from './filter-value-fields/TemporalFilterValueField'
import BoolFilterValueField from './filter-value-fields/BoolFilterValueField'

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
    const FilterValueFieldComponent = filterValueField(props.type)

    return <FilterValueFieldComponent {...props}/>
}