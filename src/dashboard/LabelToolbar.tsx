import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'

interface Props {
    data: any[]
    dash: IDash
    rootLabel: string
    checkedLabelSet: Set<string> | null
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function LabelToolbar({data, dash, rootLabel, checkedLabelSet, onChange}: Props) {
    const {labelField} = dash
    if (labelField == null)
        throw new Error('Illegal argument')

    const getLabelTreeNode = useCallback((): TreeDataNode => {
        const labels = data.map(it => it[labelField]).filter(it => it != null)
        const labelSet = new Set(labels)
        return {
            key: rootLabel,
            title: rootLabel,
            icon: <FolderOutlined/>,
            children: Array.from(labelSet).map(label => ({
                key: label,
                title: label
            }))
        }
    }, [data, labelField, rootLabel])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        onChange(new Set(checkedKeys as string[]))
    }, [onChange])

    return (
        <Tree
            checkable
            showIcon
            treeData={[getLabelTreeNode()]}
            defaultExpandedKeys={[rootLabel]}
            checkedKeys={checkedLabelSet == null ? [] : Array.from(checkedLabelSet)}
            onCheck={handleLabelTreeCheck}
        />
    )
}