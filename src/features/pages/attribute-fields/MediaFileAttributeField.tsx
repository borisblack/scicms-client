import {FC, useCallback} from 'react'
import {Button, message} from 'antd'

import {AttributeFieldProps} from '.'
import {useTranslation} from 'react-i18next'
import {FILENAME_ATTR_NAME, MEDIA_ITEM_NAME} from '../../../config/constants'
import MediaService from '../../../services/media'

const mediaService = MediaService.getInstance()

const MediaFileAttributeField: FC<AttributeFieldProps> = ({form, item, data, attrName, attribute, value}) => {
    if (item.name !== MEDIA_ITEM_NAME || attrName !== FILENAME_ATTR_NAME || data == null || value == null)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    const handleDownload = useCallback(async () => {
        try {
            await mediaService.download(data?.id as string, value)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        }
    }, [data?.id, value])

    return (
        <>
            <div className="ant-form-item" style={{margin: 0}}>
                <div className="ant-row ant-form-item-row">
                    <div className="ant-col ant-form-item-label">
                        <label htmlFor={attrName} className="ant-form-item-required" title={t(attribute.displayName)}>
                            {t('File')}
                        </label>
                    </div>
                </div>
            </div>

            <Button type="link" size="small" style={{margin: '0 0 8px 0', padding: 0}} onClick={handleDownload}>
                {value}
            </Button>
        </>
    )
}

export default MediaFileAttributeField