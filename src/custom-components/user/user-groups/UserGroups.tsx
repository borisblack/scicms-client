import {Empty} from 'antd'

import {CustomComponentRenderContext} from '../../index'
import OneToManyDataGridWrapper from '../OneToManyDataGridWrapper'
import {GROUP_MEMBER_ITEM_NAME} from '../../../config/constants'

export default function UserGroups({me, pageKey, data, onItemCreate, onItemView, onItemDelete}: CustomComponentRenderContext) {
    if (!data?.id && !data?.username)
        return <Empty/>

    return (
        <OneToManyDataGridWrapper
            me={me}
            pageKey={pageKey}
            target={GROUP_MEMBER_ITEM_NAME}
            mappedBy="username"
            mappedByValue={data.username}
            onItemCreate={onItemCreate}
            onItemView={onItemView}
            onItemDelete={onItemDelete}
        />
    )
}