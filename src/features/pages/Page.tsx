import _ from 'lodash'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {useAppDispatch} from '../../util/hooks'
import {IPage, updateLabel, ViewType} from './pagesSlice'
import {PageHeader} from 'antd'
import ItemContent from './ItemContent'
import DataGridWrapper from './DataGridWrapper'

interface Props {
    page: IPage
}

function Page({page}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const {item, viewType, id} = page

    useEffect(() => {
        // TODO: Pass callback for updating single item label
        const pageLabel = viewType === ViewType.default ? _.upperFirst(item.pluralName) : `${item.displayName} ${id ? id.substring(0, 9) : '*'}`
        dispatch(updateLabel({label: pageLabel, item, viewType, id}))
    }, [item, viewType, id, dispatch, t])

    return (
        <div className="page-content">
                <PageHeader title={page.label} subTitle={''}/>
                {viewType === ViewType.default ?
                    // <DataTable item={item}/> :
                    <DataGridWrapper item={item}/> :
                    <ItemContent item={item} viewType={viewType} id={id}/>
                }
        </div>
    )
}

export default Page