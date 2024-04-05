import {Empty} from 'antd'

import {CustomComponentRenderContext} from '../../index'
import OneToManyDataGridWrapper from '../OneToManyDataGridWrapper'
import {GROUP_MEMBER_ITEM_NAME, USER_ITEM_NAME} from '../../../../config/constants'

export default function UserGroups({data: dataWrapper}: CustomComponentRenderContext) {
  const {data} = dataWrapper
  if (!data?.id && !data?.username)
    return <Empty/>

  return (
    <OneToManyDataGridWrapper
      data={dataWrapper}
      itemName={USER_ITEM_NAME}
      targetItemName={GROUP_MEMBER_ITEM_NAME}
      mappedBy="username"
      mappedByValue={data.username}
    />
  )
}