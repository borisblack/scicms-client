import {Empty, Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback, useMemo} from 'react'
import {Dataset, FieldType, IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'
import {formatValue} from '../util/bi'

interface Props {
    dataset: Dataset
    dash: IDash
    data: any[]
    labelFieldName: string
    checkedLabelSet: Set<string> | null
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function LabelToolbar({dataset, dash, data, labelFieldName, checkedLabelSet, onChange}: Props) {
    const labelName = useMemo(() => dash.optValues[labelFieldName], [dash.optValues, labelFieldName])
    const labelType: FieldType = useMemo(() => dataset.spec.columns[labelName].type, [dataset.spec.columns, labelName])
    const labelAlias = useMemo(() => dataset.spec.columns[labelName].alias || labelName, [dataset.spec.columns, labelName])

    const getMetricTreeNode = useCallback((): TreeDataNode => {
        const labels = data.map(it => it[labelName]).filter(it => it != null)
        const labelSet = new Set(labels)
        return {
            key: labelName,
            title: labelAlias,
            icon: <FolderOutlined/>,
            children: Array.from(labelSet).map(label => ({key: label, title: formatValue(label, labelType)}))
        }
    }, [data, labelAlias, labelName, labelType])

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