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

const MediaAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, setLoading}) => {
    if (attribute.type !== AttrType.media)
        throw new Error('Illegal attribute')

    const mediaData = value?.data as Media | null
    const {t} = useTranslation()
    const [fileList, setFileList] = useState<UploadFile[]>(getInitialUploadFileList())
    const mediaRef = useRef<Media | MediaInfo | null>(mediaData)
    const isDisabled = attribute.keyed || attribute.readOnly
    const mediaService = useMemo(() => MediaService.getInstance(), [])

    const normFile = (e: any) => {
        if (Array.isArray(e))
            return e

        return e?.fileList
    }

    function getInitialUploadFileList(): UploadFile[] {
        if (!mediaData)
            return []

        return [{
            uid: '-1',
            name: mediaData.filename,
            status: 'done',
            url: mediaService.getDownloadUrlById(mediaData.id)
        }]
    }

    function beforeUpload(file: RcFile) {
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
        setLoading(true)
        if (mediaRef.current) {
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
                <Input/>
            </FormItem>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={attribute.displayName}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                required={attribute.required}
                dependencies={[`${attrName}.id`]}
                rules={[
                    ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!attribute.required || getFieldValue(`${attrName}.id`))
                            return Promise.resolve()

                        return Promise.reject(new Error(t('Required field')))
                    }})
                ]}
            >
                <Upload
                    name="files"
                    listType="picture"
                    maxCount={1}
                    disabled={isDisabled}
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onDownload={handleDownload}
                    onRemove={handleRemove}
                >
                    {fileList.length === 0 && <Button size="middle" icon={<UploadOutlined />}>{t('Add')}</Button>}
                </Upload>
            </FormItem>
        </>
    )
}

export default MediaAttributeField