import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback, useMemo} from 'react'
import {IDash, ItemData, Location} from '../types'
import {FolderOutlined} from '@ant-design/icons'
import {childTreeNodeKeyRegExp} from '../util/dashboard'

interface Props {
    dash: IDash
    results: ItemData[][]
    onChange: (checkedLabelSets: Set<string>[]) => void
}

export default function LocationToolbar({dash, results, onChange}: Props) {
    const datasetItemNameKeys = useMemo(() => dash.datasets.map((dataset, i) => `${dataset.itemName as string}-${i}`), [dash.datasets])

    const getLocationTreeData = useCallback((): TreeDataNode[] => dash.datasets.map((dataset, i) => {
        const datasetResult: ItemData[] = results[i]
        const {location} = dataset
        const locationLabels = location ? datasetResult.filter(itemData => itemData[location]).map(itemData => (itemData[location].data as Location).label) : []
        return {
            key: `${dataset.itemName}-${i}`,
            title: dataset.itemName as string,
            icon: <FolderOutlined/>,
            disabled: !location,
            children: locationLabels.map(locationLabel => ({
                key: `${locationLabel}-${i}-child`,
                title: locationLabel
            }))
        }
    }), [dash.datasets, results])

    const handleLocationTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        const checkedLocationLabelSets: Set<string>[] = new Array(dash.datasets.length).fill(new Set<string>())
        for (const checkedKey of (checkedKeys as string[])) {
            const matches = checkedKey.match(childTreeNodeKeyRegExp)
            if (!matches)
                continue

            const [, label, index] = matches
            const i = parseInt(index)
            const datasetLabelSet = checkedLocationLabelSets[i]
            datasetLabelSet.add(label)
        }

        onChange(checkedLocationLabelSets)
    }, [dash.datasets.length, onChange])

    return (
        <Tree
            checkable
            showIcon
            defaultExpandedKeys={[...datasetItemNameKeys]}
            defaultCheckedKeys={[...datasetItemNameKeys]}
            treeData={getLocationTreeData()}
            onCheck={handleLocationTreeCheck}
        />
    )
}