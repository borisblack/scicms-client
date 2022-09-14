import {FC, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Input, message, Upload} from 'antd'
import {UploadOutlined} from '@ant-design/icons'
import {RcFile, UploadFile} from 'antd/es/upload/interface'

import {AttrType, Media, MediaInfo} from '../../../types'
import {AttributeFieldProps} from '.'
import MediaService from '../../../services/media'
import styles from './AttributeField.module.css'

const {Item: FormItem} = Form

const MediaAttributeField: FC<AttributeFieldProps> = ({pageKey, form, item, attrName, attribute, value, setLoading}) => {
    if (attribute.type !== AttrType.media)
        throw new Error('Illegal attribute')

    const mediaData = (value?.data ?? attribute.defaultValue) as Media | null | undefined
    const {t} = useTranslation()
    const mediaService = useMemo(() => MediaService.getInstance(), [])
    const [fileList, setFileList] = useState<UploadFile[]>(getInitialUploadFileList())
    const mediaRef = useRef<Media | MediaInfo | null | undefined>(mediaData)
    const isDisabled = attribute.keyed || attribute.readOnly

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
            url: mediaService.getDownloadUrlById(mediaData.id)
        }]
    }

    function beforeUpload(file: RcFile, fileList: RcFile[]) {
        setFileList([file])
        return false
    }

    async function handleDownload(file: UploadFile) {
        if (!mediaRef.current)
            throw Error('Illegal state')

        const {id, filename} = mediaRef.current
        setLoading(true)
        try {
            await mediaService.download(id, filename)
        } finally {
            setLoading(false)
        }
    }

    async function handleRemove(file: UploadFile) {
        file.status = 'uploading'
        setFileList([file])

        // Can be used by another versions or localizations
        if (mediaRef.current && !item.versioned && !item.localized) {
            setLoading(true)
            try {
                await mediaService.deleteById(mediaRef.current.id)
                mediaRef.current = null
            } catch (e: any) {
                file.status = 'error'
                setFileList([file])
                message.error(e.message)
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
                <Input id={`${pageKey}#${attrName}.id`}/>
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
                    id={`${pageKey}#${attrName}`}
                    name="files"
                    maxCount={1}
                    disabled={isDisabled}
                    defaultFileList={getInitialUploadFileList()}
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onPreview={handleDownload}
                    onRemove={handleRemove}
                >
                    {fileList.length === 0 && <Button size="middle" icon={<UploadOutlined />}>{t('Add')}</Button>}
                </Upload>
            </FormItem>
        </>
    )
}

export default MediaAttributeField