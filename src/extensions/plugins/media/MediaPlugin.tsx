import {FILENAME_ATTR_NAME, MEDIA_ITEM_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {MediaFileAttributeField} from './attributeFields'

const MEDIA_FILE_ATTRIBUTE_FIELD_ID = 'mediaFile'

export class MediaPlugin extends Plugin {
  override onLoad(): void {
    this.addAttributeField({
      id: MEDIA_FILE_ATTRIBUTE_FIELD_ID,
      mountPoint: `${MEDIA_ITEM_NAME}.${FILENAME_ATTR_NAME}`,
      render: ({context}) => <MediaFileAttributeField {...context} />
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}
