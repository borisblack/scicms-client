import React from 'react'

import Text from '../../components/Text'
import {Attribute, AttrType} from '../../types'

interface Props {
    attrName: string
    attribute: Attribute
    value: any
}

function UIComponent({attrName, attribute, value}: Props) {
    function renderUIComponent() {
        switch (attribute.type) {
            case AttrType.string:
                return <Text attrName={attrName} attribute={attribute} value={value}/>
            default:
                return null
        }
    }

    return renderUIComponent()
}

export default UIComponent

