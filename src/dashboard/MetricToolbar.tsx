import {Tree, TreeDataNode, TreeProps} from 'antd'
import {useCallback} from 'react'
import {IDash} from '../types'
import {FolderOutlined} from '@ant-design/icons'
import {DashOpt} from './dashes'
import {useTranslation} from 'react-i18next'

interface Props {
    data: any[]
    dash: IDash
    metricDashOpt: DashOpt
    checkedMetricSet: Set<string> | null
    onChange: (checkedLabelSet: Set<string>) => void
}

export default function MetricToolbar({data, metricDashOpt, checkedMetricSet, onChange}: Props) {
    const {name: metricField, label: metricLabel} = metricDashOpt
    const {t} = useTranslation()

    const getMetricTreeNode = useCallback((): TreeDataNode => {
        const metrics = data.map(it => it[metricField]).filter(it => it != null)
        const metricSet = new Set(metrics)
        return {
            key: metricField,
            title: t(metricLabel),
            icon: <FolderOutlined/>,
            children: Array.from(metricSet).map(label => ({
                key: label,
                title: label
            }))
        }
    }, [data, metricField, metricLabel, t])

    const handleLabelTreeCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
        onChange(new Set(checkedKeys as string[]))
    }, [onChange])

    return (
        <Tree
            checkable
            showIcon
            treeData={[getMetricTreeNode()]}
            defaultExpandedKeys={[metricLabel]}
            checkedKeys={checkedMetricSet == null ? [] : Array.from(checkedMetricSet)}
            onCheck={handleLabelTreeCheck}
        />
    )
}