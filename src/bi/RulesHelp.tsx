import {useTranslation} from 'react-i18next'
import React, {useMemo} from 'react'
import {Tabs} from 'antd'
import Colors from '../components/Colors'
import IconsSuspense from '../components/icons/IconsSuspense'

interface Props {
    height?: number | string
}

export default function RulesHelp({height}: Props) {
  const {t} = useTranslation()

  return <Tabs items={[
    {key: 'rules', label: t('Rules'), children: <RulesDescription height={height}/>},
    {key: 'colors', label: t('Colors'), children: <Colors height={height}/>},
    {key: 'icons', label: t('Icons'), children: <IconsSuspense height={height}/>}
  ]}/>
}

function RulesDescription({height}: Props) {
  const {t} = useTranslation()

  const descriptionContent = useMemo(() => {
    const helpDescription = t('Rules help description')
    return (
      <p>
        {helpDescription.split('\n').map((s, i) => <span key={i}>{s}<br/></span>)}
      </p>
    )
  }, [t])

  return (
    <div style={{height, overflowY: 'scroll'}}>
      <h4 style={{fontWeight: 600}}>{t('Description')}</h4>
      {descriptionContent}

      <h4 style={{fontWeight: 600}}>{t('Properties')}</h4>
      <ul>
        <li>icon</li>
        <li>color</li>
        <li>bgColor</li>
        <li>fontSize</li>
        <li>fontStyle</li>
        <li>fontWeight</li>
      </ul>

      <h4 style={{fontWeight: 600}}>{t('Examples')}</h4>
      <code>
        {'count<=0 ? *.color=red;count.icon=ExclamationCircleOutlined-red;name.bgColor=#ffcccc'}<br/>
        <span style={{color: '#999999'}}>{'# name==\'Foo\' ? *.bgColor=#ccffcc;name.icon=InfoCircleOutlined-#009933'}</span><br/>
        {'name==\'Bar\' ? *.bgColor=#ccffff;name.icon=SmileOutlined-#0066ff'}
      </code>
    </div>
  )
}