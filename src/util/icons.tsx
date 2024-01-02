import * as antdIcons from '@ant-design/icons/lib/icons'
import {FieldBinaryOutlined} from '@ant-design/icons'
import * as _faIcons from 'react-icons/fa'
import * as _faIcons6 from 'react-icons/fa6'
import {FieldType} from '../types'
import {BiCalendar, BiHash, BiText} from 'react-icons/bi'

interface FieldTypeIconProps {
    fieldType: FieldType
}

export const faIcons = {..._faIcons}

export const faIcons6 = {..._faIcons6}

export const allFaIcons = {...faIcons, ...faIcons6}

export const allIcons: {[name: string]: any} = {...antdIcons, ...allFaIcons}

export {antdIcons}

export function FieldTypeIcon({fieldType}: FieldTypeIconProps) {
    switch (fieldType) {
        case FieldType.int:
        case FieldType.long:
        case FieldType.float:
        case FieldType.double:
        case FieldType.decimal:
            return <BiHash title={fieldType}/>
        case FieldType.string:
        case FieldType.text:
            return <BiText title={fieldType} />
        case FieldType.bool:
            return <FieldBinaryOutlined title={fieldType} />
        case FieldType.date:
        case FieldType.time:
        case FieldType.datetime:
        case FieldType.timestamp:
            return <BiCalendar title={fieldType}/>
        default:
            return null
    }
}
