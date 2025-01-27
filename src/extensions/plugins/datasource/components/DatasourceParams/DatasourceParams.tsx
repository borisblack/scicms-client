import {useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Col, Form, FormInstance, Row, Select, Typography} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {DATASOURCE_ITEM_NAME} from 'src/config/constants'
import {useAcl} from 'src/util/hooks'
import {CustomComponentContext} from 'src/extensions/plugins/types'
import {Datasource, DatasourceType} from 'src/types/schema'
import {DefaultOptionType} from 'antd/es/select'

const {Text} = Typography

const delimiterOptions: DefaultOptionType[] = [
  {label: ',', value: ','},
  {label: ';', value: ';'}
]

export function DatasourceParams({form, data: dataWrapper, buffer, onBufferChange}: CustomComponentContext) {
  const data = dataWrapper.data as Datasource | undefined
  const {item} = dataWrapper
  if (item.name !== DATASOURCE_ITEM_NAME) throw new Error('Illegal argument')

  const {t} = useTranslation()
  const acl = useAcl(item, data)
  const sourceType = Form.useWatch('sourceType', form as FormInstance)
  const params: Record<string, any> = useMemo(() => buffer.params ?? {}, [buffer])
  const delimiter: string = useMemo(() => params.delimiter ?? ',', [params])
  const firstLineIsAHeading: boolean = useMemo(() => params.firstLineIsAHeading ?? true, [params])

  useEffect(() => {
    onBufferChange({
      params: data?.params ?? {}
    })
  }, [data])

  function handleDelimiterSelect(newDelimiter: string) {
    onBufferChange({
      ...buffer,
      params: {
        ...params,
        delimiter: newDelimiter
      }
    })
  }

  const handleFirstLineIsAHeadingCheck = (e: CheckboxChangeEvent) =>
    onBufferChange({
      ...buffer,
      params: {
        ...params,
        firstLineIsAHeading: e.target.checked
      }
    })

  const hasAvailableParams = () => sourceType === DatasourceType.SPREADSHEET || sourceType === DatasourceType.CSV

  return (
    <Row>
      {sourceType === DatasourceType.CSV && (
        <Col span={24} style={{marginBottom: 16}}>
          <Text>{`${t('Delimiter')}:`}</Text>
          &nbsp;&nbsp;
          <Select
            size="small"
            disabled={!acl.canWrite}
            options={delimiterOptions}
            value={delimiter}
            onSelect={handleDelimiterSelect}
          />
        </Col>
      )}

      {(sourceType === DatasourceType.SPREADSHEET || sourceType === DatasourceType.CSV) && (
        <Col span={24}>
          <Checkbox disabled={!acl.canWrite} checked={firstLineIsAHeading} onChange={handleFirstLineIsAHeadingCheck}>
            {t('First line is a heading')}
          </Checkbox>
        </Col>
      )}

      {!hasAvailableParams() && (
        <Col span={24}>
          <Text disabled>{t('No available parameters')}</Text>
        </Col>
      )}
    </Row>
  )
}
