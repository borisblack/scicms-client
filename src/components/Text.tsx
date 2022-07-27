import React from 'react'
import {Form, Input} from 'antd'

import {Attribute} from '../types'
import {useTranslation} from 'react-i18next'

interface Props {
    attrName: string
    attribute: Attribute
    value: string | null
}

const FormItem = Form.Item
function Text({attrName, attribute, value}: Props) {
    const {t} = useTranslation()

    return (
        <FormItem
            name={attrName}
            label={attribute.displayName}
            initialValue={value}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <Input/>
        </FormItem>
    )
}

export default Text