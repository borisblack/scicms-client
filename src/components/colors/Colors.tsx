import {HexColorPicker} from 'react-colorful'
import {useState} from 'react'
import {Button, Space, Tooltip} from 'antd'
import {useTranslation} from 'react-i18next'
import {copyToClipboard} from '../../util'
import {CopyOutlined} from '@ant-design/icons'

interface Props {
    height?: number | string
}

export default function Colors({height}: Props) {
    const {t} = useTranslation()
    const [color, setColor] = useState<string>('#aabbcc')

    return (
        <div style={{height, overflowY: 'scroll'}}>
            <Space align="center">
                <HexColorPicker color={color} onChange={setColor}/>
                <Tooltip title={t('Copy')}>
                    <Button
                        disabled={false}
                        icon={<CopyOutlined/>}
                        size="large"
                        onClick={() => copyToClipboard(color)}
                    />
                </Tooltip>
            </Space>
        </div>
    )
}