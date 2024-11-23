import {FC, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Input, notification, Upload} from 'antd'
import {UploadOutlined} from '@ant-design/icons'
import {RcFile, UploadFile} from 'antd/es/upload/interface'
import {FieldType, MediaInfo} from 'src/types'
import {Media} from 'src/types/schema'
import {AttributeFieldProps} from '.'
import * as MediaService from 'src/services/media'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'

const {Item: FormItem} = Form

const MediaAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, form, attrName, attribute, value, setLoading}) => {
  if (attribute.type !== FieldType.media)
    throw new Error('Illegal attribute')

  const {item} = dataWrapper
  const uniqueKey = generateKey(dataWrapper)
  const mediaData = (value?.data ?? attribute.defaultValue) as Media | MediaInfo | null | undefined
  const {t} = useTranslation()
  const [fileList, setFileList] = useState<UploadFile[]>(getInitialUploadFileList())
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled)
      additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  const normFile = (e: any) => {
    return e.fileList.length === 0 ? [] : [e.file]
  }

  function getInitialUploadFileList(): UploadFile[] {
    if (!mediaData)
      return []

    return [{
      uid: mediaData.id,
      name: mediaData.filename,
      status: 'done',
      url: MediaService.getDownloadUrlById(mediaData.id)
    }]
  }

  function beforeUpload(file: RcFile, fileList: RcFile[]) {
    setFileList([file])
    return false
  }

  async function handleDownload() {
    if (!mediaData)
      return

    const {id, filename} = mediaData
    setLoading(true)
    try {
      await MediaService.download(id, filename)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(file: UploadFile) {
    file.status = 'uploading'
    setFileList([file])

    // Can be used by another versions or localizations
    if (mediaData && !item.versioned && !item.localized) {
      setLoading(true)
      try {
        await MediaService.deleteById(mediaData.id)
      } catch (e: any) {
        file.status = 'error'
        setFileList([file])
        notification.error({
          message: t('Downloading error'),
          description: e.message
        })
        return false
      } finally {
        setLoading(false)
      }
    }

    setFileList([])
    form.setFieldValue(`${attrName}.id`, null)
  }

  return (
    <>
      <FormItem hidden name={`${attrName}.id`} initialValue={mediaData?.id}>
        <Input id={`${uniqueKey}#${attrName}.id`}/>
      </FormItem>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        required={attribute.required && !attribute.readOnly}
        dependencies={[`${attrName}.id`]}
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <Upload
          id={`${uniqueKey}#${attrName}`}
          name="files"
          maxCount={1}
          accept={attribute.accept}
          defaultFileList={getInitialUploadFileList()}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onPreview={handleDownload}
          onRemove={handleRemove}
          {...additionalProps}
        >
          {fileList.length === 0 && <Button size="middle" icon={<UploadOutlined />}>{t('Add')}</Button>}
        </Upload>
      </FormItem>
    </>
  )
}

export default MediaAttributeField