import {AttrType, Item, RelType} from '../../types'
import {Spin, Tabs} from 'antd'
import React, {useState} from 'react'
import {ViewType} from './pagesSlice'

interface Props {
    item: Item
    viewType: ViewType
    id?: string
}

const TabPane = Tabs.TabPane

function ItemContent({item, id}: Props) {
    const [loading, setLoading] = useState(false)

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
        <Spin spinning={loading}>
        </Spin>
    )
}

export default ItemContent