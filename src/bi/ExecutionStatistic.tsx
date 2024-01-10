import {useTranslation} from 'react-i18next'
import {format as formatSql} from 'sql-formatter'
import {Descriptions, Space, Typography} from 'antd'
import {CopyOutlined} from '@ant-design/icons'

import CodeEditor from '../components/CodeEditor'
import {EditorMode} from 'src/components/CodeEditor/constants'
import {copyToClipboard} from '../util'
import {ExecutionStatisticInfo} from '../types/bi'
import styles from './ExecutionStatistic.module.css'

interface ExecutionStatisticProps extends ExecutionStatisticInfo {}

const {Title, Link} = Typography

export default function ExecutionStatistic({timeMs, cacheHit, query, params}: ExecutionStatisticProps) {
    const {t} = useTranslation()

    function renderQuery() {
        if (!query)
            return null

        const queryStr = formatSql(query, {paramTypes: {positional: true, named: [':']}})

        return (
            <div style={{marginBottom: 16}}>
                <Space>
                    <Title level={5} style={{display: 'inline'}}>{t('SQL query')}</Title>
                    <Link onClick={() => copyToClipboard(queryStr, false)}>
                        <CopyOutlined title={t('Copy')}/>
                    </Link>
                </Space>
                <div className={styles.editor}>
                    <CodeEditor
                        value={queryStr}
                        mode={EditorMode.SQL}
                        height="400px"
                        canEdit={false}
                    />
                </div>
            </div>
        )
    }

    function renderParams() {
        if (!params)
            return null

        const paramsStr = JSON.stringify(params, null, 4)

        return (
            <div style={{marginBottom: 16}}>
                <Space>
                    <Title level={5} style={{display: 'inline'}}>{t('Parameters')}</Title>
                    <Link onClick={() => copyToClipboard(paramsStr, false)}>
                        <CopyOutlined title={t('Copy')}/>
                    </Link>
                </Space>
                <div className={styles.editor}>
                    <CodeEditor
                        value={paramsStr}
                        mode={EditorMode.JAVASCRIPT}
                        height="300px"
                        canEdit={false}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <Descriptions>
                <Descriptions.Item label={t('Execution time, ms')}>{timeMs}</Descriptions.Item>
                <Descriptions.Item
                    label={t('Retrieved from cache')}>{t(cacheHit ? 'Yes' : 'No')}</Descriptions.Item>
            </Descriptions>

            {renderQuery()}

            {renderParams()}
        </>
    )
}