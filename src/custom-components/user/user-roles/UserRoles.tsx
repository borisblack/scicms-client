import {CustomComponentRenderContext} from '../../index'
import OneToManyDataGridWrapper from '../OneToManyDataGridWrapper'
import {ROLE_ITEM_NAME} from '../../../config/constants'
import {Empty} from 'antd'

export default function UserRoles({me, pageKey, data, onItemCreate, onItemView, onItemDelete}: CustomComponentRenderContext) {
    if (!data?.id && !data?.username)
        return <Empty/>

    return (
        <OneToManyDataGridWrapper
            me={me}
            pageKey={pageKey}
            target={ROLE_ITEM_NAME}
            mappedBy="username"
            mappedByValue={data.username}
            onItemCreate={onItemCreate}
            onItemView={onItemView}
            onItemDelete={onItemDelete}
        />
    )
}