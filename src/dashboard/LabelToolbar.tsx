import {Empty, Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'

interface Props {
    data: any[]
    dash: IDash
    labelField: {
        name: string,
        alias: string
    }
    checkedLabelSet: Set<string> | null
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function LabelToolbar({data, dash, labelField, checkedLabelSet, onChange}: Props) {
    const labelName = dash.optValues[labelField.name]
    const labelAlias = dash.optValues[labelField.alias]

    const getMetricTreeNode = useCallback((): TreeDataNode => {
        const metrics = data.map(it => it[labelName]).filter(it => it != null)
        const metricSet = new Set(metrics)
        return {
            key: labelName,
            title: labelAlias,
            icon: <FolderOutlined/>,
            children: Array.from(metricSet).map(label => ({
                key: label,
                title: label
            }))
        }
    }, [data, labelAlias, labelName])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        onChange(new Set(checkedKeys as string[]))
    }, [onChange])

    if (!labelName || !labelAlias)
        return <Empty/>

    return (
        <Tree
            checkable
            showIcon
            treeData={[getMetricTreeNode()]}
            defaultExpandedKeys={[labelName]}
            checkedKeys={checkedLabelSet == null ? [] : Array.from(checkedLabelSet)}
            onCheck={handleLabelTreeCheck}
        />
    )
}