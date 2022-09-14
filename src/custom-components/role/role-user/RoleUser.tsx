import {CustomComponentRenderContext} from '../../index'
import {FormInstance} from 'antd'
import StringRelationAttributeField from '../../../features/pages/attribute-fields/StringRelationAttributeField'

const USERNAME_ATTR_NAME = 'username'

export default function RoleUser({pageKey, item, data, form, onItemView}: CustomComponentRenderContext) {
    return (
        <StringRelationAttributeField
            pageKey={pageKey}
            form={form as FormInstance}
            item={item}
            attrName={USERNAME_ATTR_NAME}
            attribute={item.spec.attributes[USERNAME_ATTR_NAME]}
            target="user"
            value={data ? data[USERNAME_ATTR_NAME] : null}
            forceVisible
            onItemView={onItemView}
        />
    )
}