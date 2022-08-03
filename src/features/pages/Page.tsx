import _ from 'lodash'
import {MouseEvent, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import * as icons from '@ant-design/icons'
import {PlusCircleOutlined} from '@ant-design/icons'

import {useAppDispatch} from '../../util/hooks'
import {IPage, updateLabel, ViewType} from './pagesSlice'
import {Button, PageHeader} from 'antd'
import ItemContent from './ItemContent'
import DataGridWrapper from './DataGridWrapper'
import {UserInfo} from '../../types'
import * as ACL from '../../util/acl'

interface Props {
    me: UserInfo
    page: IPage
}

function Page({me, page}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const {item, viewType, id} = page
    const Icon = item.icon ? (icons as any)[item.icon] : null
    const subTitle = id ? id.substring(0, 9) : '*'
    const canCreate = !!item.permission.data && ACL.canCreate(me, item.permission.data)

    useEffect(() => {
        // TODO: Pass callback for updating single item label
        const pageLabel = viewType === ViewType.default ? _.upperFirst(item.pluralName) : `${item.displayName} ${subTitle}`
        dispatch(updateLabel({label: pageLabel, item, viewType, id}))
    }, [item, viewType, id, subTitle, dispatch, t])

    function handleCreate(evt: MouseEvent) {
        console.log('Open page')
    }

    return (
        <div className="page-content">
                <PageHeader
                    title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{page.label}</span>}
                    subTitle={viewType === ViewType.default ? null : subTitle}
                    extra={(viewType === ViewType.default && canCreate) ?
                        <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button> : null}
                />
                {viewType === ViewType.default ?
                    <DataGridWrapper item={item}/> :
                    <ItemContent item={item} viewType={viewType} id={id}/>
                }
        </div>
    )
}

export default Page