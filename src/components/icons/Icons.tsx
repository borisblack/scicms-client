import {Col, Row, Tabs} from 'antd'
import {FC} from 'react'
import {copyToClipboard} from '../../util'
import {useCache} from '../../util/hooks'
import {loadAntdIcons, loadAllFaIcons} from './loaders'

interface Props {
    height?: number | string
    onSelect?: (iconName: string) => void
}

export default function Icons({height, onSelect = copyToClipboard}: Props) {
    const {data: antdIcons} = useCache<Record<string, any>>(loadAntdIcons)
    const {data: allFaIcons} = useCache<Record<string, any>>(loadAllFaIcons)

    if (!antdIcons || !allFaIcons)
        return null

    const renderIcons = (icons: Record<string, FC>) => (
        <div style={{height, overflowY: 'scroll'}}>
            <Row>
                {Object.keys(icons).map(iconName => {
                    const Icon = icons[iconName]

                    return (
                        <Col span={6} key={iconName}>
                            <span style={{cursor: 'pointer'}} onClick={() => {onSelect(iconName)}}><Icon/>&nbsp;{iconName}</span>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )

    return (
        <Tabs type="card" items={[
            {key: 'antd', label: 'Ant Design', children: renderIcons(antdIcons)},
            {key: 'fa', label: 'Font Awesome', children: renderIcons({...allFaIcons})}
        ]}/>
    )
}