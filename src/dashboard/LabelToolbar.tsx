import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback, useMemo} from 'react'
import {IDash, ItemData} from '../types'
import {FolderOutlined} from '@ant-design/icons'
import {childTreeNodeKeyRegExp} from '../util/dashboard'

interface Props {
    dash: IDash
    results: ItemData[][]
    onChange: (checkedLabelSets: Set<string>[]) => void
}

export default function LabelToolbar({dash, results, onChange}: Props) {
    const datasetItemNameKeys = useMemo(() => dash.datasets.map((dataset, i) => `${dataset.itemName as string}-${i}`), [dash.datasets])

    const getLabelTreeData = useCallback((): TreeDataNode[] => dash.datasets.map((dataset, i) => {
        const datasetResult: ItemData[] = results[i]
        const label = dataset.label as string
        const labels = datasetResult.filter(itemData => itemData[label]).map(itemData => itemData[label] as string)
        return {
            key: `${dataset.itemName}-${i}`,
            title: dataset.itemName as string,
            icon: <FolderOutlined/>,
            children: labels.map(label => ({
                key: `${label}-${i}-child`,
                title: label
            }))
        }
    }), [dash.datasets, results])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        const checkedLabelSets: Set<string>[] = new Array(dash.datasets.length).fill(new Set<string>())
        for (const checkedKey of (checkedKeys as string[])) {
            const matches = checkedKey.match(childTreeNodeKeyRegExp)
            if (!matches)
                continue

            const [, label, index] = matches
            const i = parseInt(index)
            const datasetLabelSet = checkedLabelSets[i]
            datasetLabelSet.add(label)
        }

        onChange(checkedLabelSets)
    }, [dash.datasets.length, onChange])

    return (
        <Tree
            checkable
            showIcon
            defaultExpandedKeys={[...datasetItemNameKeys]}
            defaultCheckedKeys={[...datasetItemNameKeys]}
            treeData={getLabelTreeData()}
            onCheck={handleLabelTreeCheck}
        />
    )
}