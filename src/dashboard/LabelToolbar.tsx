import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {Dataset} from '../types'
import {FolderOutlined} from '@ant-design/icons'

interface Props {
    dataset: Dataset
    data: any[]
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function LabelToolbar({dataset, data, onChange}: Props) {
    const getLabelTreeNode = useCallback((): TreeDataNode => {
        const labels = data.map(it => it[dataset.labelField]).filter(it => it != null)
        const labelSet = new Set(labels)
        return {
            key: dataset.name,
            title: dataset.name,
            icon: <FolderOutlined/>,
            children: Array.from(labelSet).map(label => ({
                key: label,
                title: label
            }))
        }
    }, [data, dataset.labelField, dataset.name])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        const checkedLabelSet: Set<string> = new Set()
        checkedKeys.forEach((key: string) => {
            checkedLabelSet.add(key)
        })

        onChange(checkedLabelSet)
    }, [onChange])

    return (
        <Tree
            checkable
            showIcon
            defaultExpandedKeys={[dataset.name]}
            defaultCheckedKeys={[dataset.name]}
            treeData={[getLabelTreeNode()]}
            onCheck={handleLabelTreeCheck}
        />
    )
}