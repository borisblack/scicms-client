import {Empty} from 'antd'

import {GROUP_MEMBER_ITEM_NAME, USER_ITEM_NAME} from 'src/config/constants'
import {CustomComponentContext} from '../../types'
import OneToManyDataGridWrapper from './OneToManyDataGridWrapper'

export function UserGroups({data: dataWrapper}: CustomComponentContext) {
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