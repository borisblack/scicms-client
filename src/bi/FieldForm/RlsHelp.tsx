import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'

interface Props {
  height?: number | string
}

export default function RlsHelp({height}: Props) {
  return <RlsDescription height={height} />
}

function RlsDescription({height}: Props) {
  const {t} = useTranslation()

  const descriptionContent = useMemo(() => {
    const helpDescription = t('RLS help description')
    return (
      <p>
        {helpDescription.split('\n').map((s, i) => (
          <span key={i}>
            {s}
            <br />
          </span>
        ))}
      </p>
    )
  }, [t])

  return (
    <div style={{height, overflowY: 'scroll'}}>
      <h4 style={{fontWeight: 600}}>{t('Description')}</h4>
      {descriptionContent}

      <h4 style={{fontWeight: 600}}>{t('Examples')}</h4>
      <code>
        {"'value1': user1, user2, @role:ROLE_MANAGER"}
        <br />
        {'*: user3, user4'}
        <br />
        <span style={{color: '#999999'}}>{"# 'value2': user5"}</span>
        <br />
        {"'value3': *"}
      </code>
    </div>
  )
}
