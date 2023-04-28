import {Col, notification, Row, Tabs} from 'antd'
import {antdIcons, faIcons} from '../../util/icons'
import {useTranslation} from 'react-i18next'
import {FC} from 'react'

export default function Icons() {
    const {t} = useTranslation()

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            notification.info({message: t('Copied to clipboard'), description: text})
        })
    }

    const renderIcons = (icons: Record<string, FC>) => (
        <div style={{height: 350, overflowY: 'scroll'}}>
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