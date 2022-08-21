import {Form, Input, message, Upload} from 'antd'
import {FC, useMemo, useRef, useState} from 'react'
import {RcFile, UploadFile} from 'antd/es/upload/interface'
import {UploadRequestOption} from 'rc-upload/es/interface'
import {AttrType, Media, MediaInfo} from '../../../types'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {InboxOutlined} from '@ant-design/icons'
import MediaService from '../../../services/media'
import styles from './AttributeField.module.css'

const {Item: FormItem} = Form
const {Dragger} = Upload

const MediaAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, onView}) => {
    if (attribute.type !== AttrType.media)
        throw new Error('Illegal attribute')

    const media = value?.data as Media | null
    const {t} = useTranslation()
    const [fileList, setFileList] = useState<UploadFile[]>(getInitialUploadFileList())
    const mediaRef = useRef<Media | MediaInfo | null>(media)
    const isDisabled = attribute.keyed || attribute.readOnly
    const mediaService = useMemo(() => MediaService.getInstance(), [])

    // TODO: Remove file on unmount if changes are not saved
    // useEffect(() => () => {
    //     if (mediaRef.current)
    //         mediaService.deleteById(mediaRef.current.id)
    // }, [mediaService])

    const normFile = (e: any) => {
        if (Array.isArray(e))
            return e

        return e?.fileList
    }

    function getInitialUploadFileList(): UploadFile[] {
        if (!media)
            return []

        return [{
            uid: '-1',
            name: media.filename,
            status: 'done',
            url: mediaService.getDownloadUrlById(media.id)
        }]
    }

    function beforeUpload(file: RcFile) {
        if (fileList.length > 0) {
            message.error(t('Support for single upload only'))
            return Upload.LIST_IGNORE
        }

        setFileList([file])
    }

    async function customRequest(opts: UploadRequestOption<any>) {
        const {file: fileToUpload, onSuccess, onError} = opts
        const file = fileList[0]

        try {
            const uploadedMediaInfo = await mediaService.upload(fileToUpload as RcFile)
            mediaRef.current = uploadedMediaInfo
            file.status = 'done'
            file.url = mediaService.getDownloadUrlById(uploadedMediaInfo.id)
            form.setFieldValue(`${attrName}.id`, uploadedMediaInfo.id)
            setFileList([file])

            if (onSuccess)
                onSuccess(mediaRef)
        } catch (e: any) {
            file.status = 'error'
            setFileList([file])

            if (onError)
                onError(e)
        }
    }

    function handlePreview(file: UploadFile) {
        if (!mediaRef.current)
            throw Error('Illegal state')

        const {id, filename} = mediaRef.current
        mediaService.download(id, filename)
    }

    async function handleRemove(file: UploadFile) {
        if (!mediaRef.current)
            throw Error('Illegal state')

        file.status = 'uploading'
        setFileList([file])
        try {
            await mediaService.deleteById(mediaRef.current.id)
            mediaRef.current = null
            setFileList([])
            form.setFieldValue(`${attrName}.id`, null)
        } catch (e) {
            file.status = 'error'
            setFileList([file])
            return false
        }
    }

    return (
        <>
            <FormItem hidden name={`${attrName}.id`} initialValue={value?.data ? value.data.id : null}>
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
                <Dragger
                    name="files"
                    listType="picture"
                    maxCount={1}
                    disabled={isDisabled}
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    customRequest={customRequest}
                    onPreview={handlePreview}
                    onRemove={handleRemove}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t('Click or drag file to this area to upload')}</p>
                    <p className="ant-upload-hint">{t('Support for single upload only')}</p>
                </Dragger>
            </FormItem>
        </>
    )
}

export default MediaAttributeField