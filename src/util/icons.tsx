import {CSSProperties} from 'react'
import * as _faIcons from 'react-icons/fa'
import * as _faIcons6 from 'react-icons/fa6'
import {BiCalendar, BiHash, BiText} from 'react-icons/bi'
import * as antdIcons from '@ant-design/icons/lib/icons'
import {FieldBinaryOutlined, FieldTimeOutlined} from '@ant-design/icons'
import {FieldType} from '../types'

interface FieldTypeIconProps {
    fieldType: FieldType
}

const biIconStyle: CSSProperties = {
    marginTop: 4
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
            return <BiHash style={biIconStyle} title={fieldType}/>
        case FieldType.string:
        case FieldType.text:
            return <BiText style={biIconStyle} title={fieldType} />
        case FieldType.bool:
            return <FieldBinaryOutlined title={fieldType} />
        case FieldType.date:
        case FieldType.datetime:
        case FieldType.timestamp:
            return <BiCalendar style={biIconStyle} title={fieldType}/>
        case FieldType.time:
            return <FieldTimeOutlined title={fieldType}/>
        default:
            return null
    }
}
