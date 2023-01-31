import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {Dataset, IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'

interface Props {
    dataset: Dataset
    data: any[]
    dash: IDash
    checkedLocationLabelSet: Set<string> | null
    onChange: (checkedLocationLabelSet: Set<string>) => void
}

export default function LocationToolbar({dataset, data, dash, checkedLocationLabelSet, onChange}: Props) {
    const getLocationTreeNode = useCallback((): TreeDataNode => {
        const {locationField} = dash
        const locationLabels = locationField ? data.map(it => it[locationField]).filter(it => it != null) : []
        const locationLabelSet = new Set(locationLabels)
        return {
            key: dataset.name,
            title: dataset.name,
            icon: <FolderOutlined/>,
            disabled: !locationField,
            children: Array.from(locationLabelSet).map(locationLabel => ({
                key: locationLabel,
                title: locationLabel
            }))
        }
    }, [data, dataset])

    const handleLocationTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        onChange(new Set(checkedKeys as string[]))
    }, [onChange])

    return (
        <Tree
            checkable
            showIcon
            treeData={[getLocationTreeNode()]}
            defaultExpandedKeys={[dataset.name]}
            checkedKeys={checkedLocationLabelSet == null ? [] : Array.from(checkedLocationLabelSet)}
            onCheck={handleLocationTreeCheck}
        />
    )
}