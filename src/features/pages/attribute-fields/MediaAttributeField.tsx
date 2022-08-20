import {Form, Upload} from 'antd'
import {FC, useMemo, useRef, useState} from 'react'
import {RcFile, UploadFile, UploadProps} from 'antd/es/upload/interface'
import {UploadRequestOption} from 'rc-upload/es/interface'
import {AttrType, MediaInfo} from '../../../types'
import ItemService from '../../../services/item'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {InboxOutlined} from '@ant-design/icons'
import MediaService from '../../../services/media'

const {Item: FormItem} = Form
const {Dragger} = Upload

const MediaAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, onView}) => {
    if (attribute.type !== AttrType.media)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [uploading, setUploading] = useState(false)
    const mediaInfo = useRef<MediaInfo | null>(null)

    const [viewLoading, setViewLoading] = useState<boolean>(false)
    const [isMediaModalVisible, setMediaModalVisible] = useState<boolean>(false)
    const isDisabled = attribute.keyed || attribute.readOnly
    const id: string | null = form.getFieldValue(`${attrName}.id`) ?? value?.data?.id ?? null

    const itemService = useMemo(() => ItemService.getInstance(), [])
    const mediaService = useMemo(() => MediaService.getInstance(), [])
    const media = itemService.getMedia()

    const normFile = (e: any) => {
        console.log('Upload event:', e)
        if (Array.isArray(e)) {
            return e
        }
        return e?.fileList
    }

    const customRequest = async (opts: UploadRequestOption<any>) => {
        const {file: fileToUpload, onSuccess, onError} = opts
        const file = fileList[0]

        setUploading(true)
        try {
            mediaInfo.current = await mediaService.upload(fileToUpload as RcFile)
            file.status = 'success'
            setFileList([file])

            if (onSuccess)
                onSuccess(mediaInfo)
        } catch (e: any) {
            file.status = 'error'
            setFileList([file])

            if (onError)
                onError(e)
        } finally {
            setUploading(false)
        }
    }

    const props: UploadProps = {
        name: 'files',
        fileList,
        maxCount: 1,
        beforeUpload: file => {
            setFileList([file])
            return true
        },
        customRequest,
        // showUploadList: {
        //     showDownloadIcon: true,
        //     downloadIcon: 'Download',
        //     showRemoveIcon: true,
        //     removeIcon: true,
        // },
        onRemove: async file => {
            if (!mediaInfo.current) {
                throw Error('Illegal state')
            }

            file.status = 'uploading'
            setFileList([file])
            try {
                const deletedMedia = await mediaService.deleteById(mediaInfo.current.id)
                setFileList([])
            } catch (e) {
                file.status = 'error'
                setFileList([file])
                return false
            }
        }
    }

    return (
        <>
            <FormItem label={attribute.displayName}>
                <Form.Item name={attrName} valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single upload only.</p>
                    </Dragger>
                </Form.Item>
            </FormItem>
        </>
    )
}

export default MediaAttributeField