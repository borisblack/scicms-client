import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {Dataset, IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'

interface Props {
    dataset: Dataset
    data: any[]
    dash: IDash
    checkedLabelSet: Set<string> | null
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function LabelToolbar({dataset, data, dash, checkedLabelSet, onChange}: Props) {
    const getLabelTreeNode = useCallback((): TreeDataNode => {
        const labels = data.map(it => it[dash.labelField]).filter(it => it != null)
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
    }, [dash.labelField, data, dataset.name])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        onChange(new Set(checkedKeys as string[]))
    }, [onChange])

    return (
        <Tree
            checkable
            showIcon
            treeData={[getLabelTreeNode()]}
            defaultExpandedKeys={[dataset.name]}
            checkedKeys={checkedLabelSet == null ? [] : Array.from(checkedLabelSet)}
            onCheck={handleLabelTreeCheck}
        />
    )
}