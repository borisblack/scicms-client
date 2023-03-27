import {Empty} from 'antd'

import {CustomComponentRenderContext} from '../../index'
import OneToManyDataGridWrapper from '../OneToManyDataGridWrapper'
import {GROUP_MEMBER_ITEM_NAME, USER_ITEM_NAME} from '../../../config/constants'

export default function UserGroups({me, pageKey, data, onItemCreate, onItemView, onItemDelete}: CustomComponentRenderContext) {
    if (!data?.id && !data?.username)
        return <Empty/>

    return (
        <OneToManyDataGridWrapper
            me={me}
            pageKey={pageKey}
            itemName={USER_ITEM_NAME}
            targetItemName={GROUP_MEMBER_ITEM_NAME}
            mappedBy="username"
            mappedByValue={data.username}
            itemData={data}
            onItemCreate={onItemCreate}
            onItemView={onItemView}
            onItemDelete={onItemDelete}
        />
    )
}