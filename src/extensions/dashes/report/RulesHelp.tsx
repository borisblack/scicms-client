import {useTranslation} from 'react-i18next'

interface Props {
    height?: number | string
}

export default function RulesHelp({height}: Props) {
    const {t} = useTranslation()

    return (
        <div style={{height, overflowY: 'scroll'}}>
            <h4 style={{fontWeight: 600}}>{t('Description')}</h4>
            <p>
                {`${t('The new rule starts on a new line')}.`}<br/>
                {`${t('Empty lines and whitespaces are ignored')}.`}<br/>
                {`${t('A comment line starts with a # character')}.`}<br/>
                {`${t('Cells are named after the field name in the row')}. ${t('You can select the entire row using an asterisk')}.`}
            </p>

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
                {`count<=0 ? *.color=red;count.icon=ExclamationCircleOutlined-red;name.bgColor=#ffcccc`}<br/>
                <span style={{color: '#666666'}}>{`# name=='Foo' ? *.bgColor=#ccffcc;name.icon=InfoCircleOutlined-#009933`}</span><br/>
                {`name=='Bar' ? *.bgColor=#ccffff;name.icon=SmileOutlined-#0066ff`}
            </code>
        </div>
    )
}