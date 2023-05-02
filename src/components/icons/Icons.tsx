import {Col, Row, Tabs} from 'antd'
import {antdIcons, faIcons} from '../../util/icons'
import {FC} from 'react'
import {copyToClipboard} from '../../util'

interface Props {
    height?: number | string
}

export default function Icons({height}: Props) {
    const renderIcons = (icons: Record<string, FC>) => (
        <div style={{height, overflowY: 'scroll'}}>
            <Row>
                {Object.keys(icons).map(k => {
                    const Icon = icons[k]

                    return (
                        <Col span={6} key={k}>
                            <span style={{cursor: 'pointer'}} onClick={() => {copyToClipboard(k)}}><Icon/>&nbsp;{k}</span>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )

    return <Tabs type="card" items={[
        {key: 'antd', label: 'Ant Design', children: renderIcons(antdIcons)},
        {key: 'fa', label: 'Font Awesome', children: renderIcons(faIcons)}
    ]}/>
}