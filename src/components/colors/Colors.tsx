import {HexColorPicker} from 'react-colorful'
import {useRef, useState} from 'react'
import {Button, Col, Row, Space, Tabs, Tooltip} from 'antd'
import {useTranslation} from 'react-i18next'
import {copyToClipboard} from '../../util'
import {CopyOutlined} from '@ant-design/icons'

interface Props {
    height?: number | string
}

function generateTableColors(): string[] {
    return [
        '#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00', '#CCCC00',
        '#FFCC66', '#FFCC00', '#FFCC33', '#CC9900',	'#CC9933', '#996600',
        '#FF9900', '#FF9933', '#CC9966', '#CC6600',	'#996633', '#663300',
        '#FFCC99', '#FF9966', '#FF6600', '#CC6633',	'#993300', '#660000',
        '#FF6633', '#CC3300', '#FF3300', '#FF0000',	'#CC0000', '#990000',
        '#FFCCCC', '#FF9999', '#FF6666', '#FF3333',	'#FF0033', '#CC0033',
        '#CC9999', '#CC6666', '#CC3333', '#993333', '#990033', '#330000',
        '#FF6699', '#FF3366', '#FF0066', '#CC3366', '#996666', '#663333',
        '#FF99CC', '#FF3399', '#FF0099', '#CC0066', '#993366', '#660033',
        '#FF66CC', '#FF00CC', '#FF33CC', '#CC6699', '#CC0099', '#990066',
        '#FFCCFF', '#FF99FF', '#FF66FF', '#FF33FF', '#FF00FF', '#CC3399',
        '#CC99CC', '#CC66CC', '#CC00CC', '#CC33CC', '#990099', '#993399',
        '#CC66FF', '#CC33FF', '#CC00FF', '#9900CC', '#996699', '#660066',
        '#CC99FF', '#9933CC', '#9933FF', '#9900FF', '#660099', '#663366',
        '#9966CC', '#9966FF', '#6600CC', '#6633CC', '#663399', '#330033',
        '#CCCCFF', '#9999FF', '#6633FF', '#6600FF', '#330099', '#330066',
        '#9999CC', '#6666FF', '#6666CC', '#666699', '#333399', '#333366',
        '#3333FF', '#3300FF', '#3300CC', '#3333CC', '#000099', '#000066',
        '#6699FF', '#3366FF', '#0000FF', '#0000CC', '#0033CC', '#000033',
        '#0066FF', '#0066CC', '#3366CC', '#0033FF', '#003399', '#003366',
        '#99CCFF', '#3399FF', '#0099FF', '#6699CC', '#336699', '#006699',
        '#66CCFF', '#33CCFF', '#00CCFF', '#3399CC', '#0099CC', '#003333',
        '#99CCCC', '#66CCCC', '#339999', '#669999', '#006666', '#336666',
        '#CCFFFF', '#99FFFF', '#66FFFF', '#33FFFF', '#00FFFF', '#00CCCC',
        '#99FFCC', '#66FFCC', '#33FFCC', '#00FFCC', '#33CCCC', '#009999',
        '#66CC99', '#33CC99', '#00CC99', '#339966', '#009966', '#006633',
        '#66FF99', '#33FF99', '#00FF99', '#33CC66', '#00CC66', '#009933',
        '#99FF99', '#66FF66', '#33FF66', '#00FF66', '#339933', '#006600',
        '#CCFFCC', '#99CC99', '#66CC66', '#669966', '#336633', '#003300',
        '#33FF33', '#00FF33', '#00FF00', '#00CC00', '#33CC33', '#00CC33',
        '#66FF00', '#66FF33', '#33FF00', '#33CC00', '#339900', '#009900',
        '#CCFF99', '#99FF66', '#66CC00', '#66CC33', '#669933', '#336600',
        '#99FF00', '#99FF33', '#99CC66', '#99CC00', '#99CC33', '#669900',
        '#CCFF66', '#CCFF00', '#CCFF33', '#CCCC99', '#666633', '#333300',
        '#CCCC66', '#CCCC33', '#999966', '#999933', '#999900', '#666600',
        '#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333', '#000000'
    ]
}

export default function Colors({height}: Props) {
    const {t} = useTranslation()
    const [color, setColor] = useState<string>('#AABBCC')
    const tableColors = useRef(generateTableColors())

    function handleTableColorSelect(c: string) {
        setColor(c)
        copyToClipboard(c)
    }

    const renderTable = () => {
        return (
            <div style={{height, overflowY: 'scroll', padding: '0 2px'}}>
                <Row gutter={1}>
                    {tableColors.current.map(c => (
                        <Col span={4}>
                            {c}
                            <div
                                style={{height: 20,backgroundColor: c, cursor: 'pointer', marginBottom: 4}}
                                onClick={() => handleTableColorSelect(c)}
                            />
                        </Col>
                    ))}
                </Row>
            </div>
        )
    }

    const renderPalette = () => (
        <div style={{height, overflowY: 'scroll'}}>
            <Space align="center">
                <HexColorPicker color={color} onChange={c => setColor(c.toUpperCase())}/>
                <Tooltip title={t('Copy')}>
                    <Button
                        disabled={false}
                        icon={<CopyOutlined/>}
                        size="large"
                        onClick={() => copyToClipboard(color)}
                    />
                </Tooltip>
            </Space>
            <div style={{marginTop: 8}}>{color ?? ''}</div>
        </div>
    )

    return (
        <Tabs type="card" items={[
            {key: 'table', label: t('Table'), children: renderTable()},
            {key: 'palette', label: t('Palette'), children: renderPalette()}
        ]}/>
    )
}