import {useTranslation} from 'react-i18next'
import {Descriptions, Space, Typography} from 'antd'
import React, {lazy, Suspense} from 'react'
import {EditorMode} from '../components/CodeEditor'
import {CopyOutlined} from '@ant-design/icons'
import {copyToClipboard} from '../util'
import {ExecutionStatisticInfo} from '../types/bi'

interface ExecutionStatisticProps extends ExecutionStatisticInfo {}

const {Title, Link} = Typography
const CodeEditor = lazy(() => import('src/components/CodeEditor'))

export default function ExecutionStatistic({timeMs, cacheHit, query, params}: ExecutionStatisticProps) {
    const {t} = useTranslation()

    return (
        <>
            <Descriptions>
                <Descriptions.Item label={t('Execution time, ms')}>{timeMs}</Descriptions.Item>
                <Descriptions.Item
                    label={t('Retrieved from cache')}>{t(cacheHit ? 'Yes' : 'No')}</Descriptions.Item>
            </Descriptions>

            {query && (
                <>
                    <Space>
                        <Title level={5} style={{display: 'inline'}}>{t('SQL query')}</Title>
                        <Link onClick={() => copyToClipboard(query, false)}>
                            <CopyOutlined title={t('Copy')}/>
                        </Link>
                    </Space>
                    <Suspense fallback={null}>
                        <CodeEditor
                            value={query}
                            mode={EditorMode.SQL}
                            height={400}
                            canEdit={false}
                            lineWrapping
                        />
                    </Suspense>
                </>
            )}

            {params && (
                <>
                    <Space>
                        <Title level={5} style={{display: 'inline'}}>{t('Parameters')}</Title>
                        <Link onClick={() => copyToClipboard(JSON.stringify(params), false)}>
                            <CopyOutlined title={t('Copy')}/>
                        </Link>
                    </Space>
                    <Suspense fallback={null}>
                        <CodeEditor
                            value={JSON.stringify(params)}
                            mode={EditorMode.JAVASCRIPT}
                            height={300}
                            canEdit={false}
                            lineWrapping
                        />
                    </Suspense>
                </>
            )}
        </>
    )
}