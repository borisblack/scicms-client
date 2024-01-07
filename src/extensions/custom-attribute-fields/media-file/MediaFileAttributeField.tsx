import {FC, useCallback} from 'react'
import {Button, notification} from 'antd'

import {useTranslation} from 'react-i18next'
import {FILENAME_ATTR_NAME, MEDIA_ITEM_NAME} from '../../../config/constants'
import * as MediaService from '../../../services/media'
import {CustomAttributeFieldRenderContext} from '../index'

const MediaFileAttributeField: FC<CustomAttributeFieldRenderContext> = ({data: dataWrapper, attrName, attribute, value}) => {
    const {item, data} = dataWrapper
    if (item.name !== MEDIA_ITEM_NAME || attrName !== FILENAME_ATTR_NAME || data == null || value == null)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    const handleDownload = useCallback(async () => {
        try {
            await MediaService.download(data?.id as string, value)
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Downloading error'),
                description: e.message
            })
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