import React, {useEffect, useState} from 'react'

import {useAppDispatch} from '../../hooks'
import {IPage, updateLabel, ViewType} from './pagesSlice'
import {Form, PageHeader, Spin, Tabs} from 'antd'
import UIComponent from './UIComponent'
import DataGrid from '../../components/DataGrid'
import {Attribute, AttrType, RelType} from '../../types'

interface Props {
    page: IPage
}

const TabPane = Tabs.TabPane

async function fetchItem(type: string, id: string) {
    // TODO: Build query and fetch item

    return {}
}

function Page({page}: Props) {
    const dispatch = useAppDispatch()
    const {item, viewType, id} = page
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (item == null)
            return

        const keyedProperty = getKeyedProperty()
        // const pageLabel = `${label} ${keyedProperty}`
        const pageLabel = `${keyedProperty}`
        dispatch(updateLabel({label: pageLabel, item, viewType, id}))
    }, [item])

    function updatePageLabel() {
        // TODO: Build label for single item

        dispatch(updateLabel({label: item.description, item, viewType, id}))
    }

    function getKeyedProperty() {
        // TODO: Build label for single item

        return item.description
    }

    const showRelationships = () => (viewType === 'add' || viewType === 'edit' || viewType === 'view')

    const showRootUIComponent = () => (id === undefined || item != null)

    const renderUIComponent = (attrName: string, attribute: Attribute, value: any) => (
        <Form form={form}>
            <UIComponent
                attrName={attrName}
                attribute={attribute}
                value={value}
            />
        </Form>
    )

    const showTable = () => viewType === ViewType.default

    const renderTable = () => <DataGrid item={item}/>

    function renderRelationships() {
        return (
            <Tabs>
                {Object.keys(item.spec.attributes)
                    .filter(key => {
                        const attr = item.spec.attributes[key]
                        return attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)
                    })
                    .map(key => {
                        const attr = item.spec.attributes[key]
                        // TODO: Get item and build query
                        return (
                            <TabPane key={key} tab={attr.displayName}>
                                {/*<Table initialQueryItem={initialQueryItem} isRelationship />*/}
                                {/*<DataGrid initialQueryItem={initialQueryItem} isRelationship />*/}
                            </TabPane>
                        )
                    })}
            </Tabs>
        )
    }

    return (
        <div className="page-content">
            <Spin spinning={loading}>
                <PageHeader title={page.label} subTitle={''}/>

                {/*{showRootUIComponent() && renderUIComponent()}*/}

                {showTable() && renderTable()}

                {showRelationships() && renderRelationships()}
            </Spin>
        </div>
    )
}

export default Page