import {CustomComponentRenderContext} from '../../index'
import OneToManyDataGridWrapper from '../OneToManyDataGridWrapper'
import {ROLE_ITEM_NAME, USER_ITEM_NAME} from '../../../../config/constants'
import {Empty} from 'antd'

export default function UserRoles({data: dataWrapper}: CustomComponentRenderContext) {
    const {data} = dataWrapper
    if (!data?.id && !data?.username)
        return <Empty/>

    return (
        <OneToManyDataGridWrapper
            data={dataWrapper}
            itemName={USER_ITEM_NAME}
            targetItemName={ROLE_ITEM_NAME}
            mappedBy="username"
            mappedByValue={data.username}
        />
    )
}