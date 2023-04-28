import {Col, Row, Tabs} from 'antd'
import {antdIcons} from '../../util/icons'

export default function Icons() {
    const renderAntdIcons = () => (
        <Row>
            {Object.keys(antdIcons).map(k => {
                const AntdIcon = (antdIcons as any)[k]

                return <Col span={4} key={k}></Col>
            })}
        </Row>
    )

    return <Tabs type="card" items={[
        {key: 'antd', label: 'Ant Design', children: renderAntdIcons()}
    ]}/>
}