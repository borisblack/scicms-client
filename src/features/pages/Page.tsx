import {MouseEvent, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import * as icons from '@ant-design/icons'
import {PlusCircleOutlined} from '@ant-design/icons'

import {useAppDispatch} from '../../util/hooks'
import {getLabel, IPage, openPage, ViewType} from './pagesSlice'
import {Button, PageHeader} from 'antd'
import ItemContent from './ItemContent'
import DataGridWrapper from './DataGridWrapper'
import {UserInfo} from '../../types'
import * as ACL from '../../util/acl'
import PermissionService from '../../services/permission'

interface Props {
    me: UserInfo
    page: IPage
}

function Page({me, page}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const {item, viewType, data} = page
    const Icon = item.icon ? (icons as any)[item.icon] : null
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissionId = item.permission.data?.id
    const permission = permissionId && permissionService.findById(permissionId)
    const canCreate = !!permission && ACL.canCreate(me, permission)

    function handleCreate(evt: MouseEvent) {
        dispatch(openPage({item, viewType: ViewType.add}))
    }

    return (
        <div className="page-content">
                <PageHeader
                    title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                    subTitle={viewType === ViewType.default ? null : data?.id}
                    extra={(viewType === ViewType.default && canCreate) ?
                        <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button> : null}
                />
                {viewType === ViewType.default ?
                    <DataGridWrapper me={me} item={item}/> :
                    <ItemContent item={item} viewType={viewType} data={data}/>
                }
        </div>
    )
}

export default Page