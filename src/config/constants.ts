// import process from 'process'

export const DEBUG: boolean = process.env.NODE_ENV !== 'production'
export const EMPTY_ARRAY = []

export const ANTD_GRID_COLS = 24
export const UTC = 'UTC'
export const LOWERCASE_NO_WHITESPACE_PATTERN = /^[a-z]\w*$/
export const LETTER_NO_WHITESPACE_PATTERN = /^[a-zA-Z]\w*$/
export const LETTER_NO_WHITESPACE_MESSAGE = 'String must start with a letter and contain no whitespaces'
export const LOWERCASE_NO_WHITESPACE_MESSAGE = 'String must start with a lowercase letter and contain no whitespaces'
export const LUXON_DATE_FORMAT_STRING: string = 'dd.LL.yyyy'
export const LUXON_STD_DATE_FORMAT_STRING: string = 'yyyy-LL-dd'
export const LUXON_YEAR_MONTH_FORMAT_STRING: string = 'LL.yyyy'
export const LUXON_STD_YEAR_MONTH_FORMAT_STRING: string = 'yyyy-LL'
export const LUXON_YEAR_FORMAT_STRING: string = 'yyyy'
export const LUXON_TIME_FORMAT_STRING: string = 'HH:mm'
export const LUXON_HOURS_FORMAT_STRING: string = 'HH'
export const LUXON_DATETIME_FORMAT_STRING: string = 'dd.LL.yyyy HH:mm'
export const LUXON_STD_DATETIME_FORMAT_STRING: string = 'yyyy-LL-dd HH:mm'
export const LUXON_DATE_HOURS_FORMAT_STRING: string = 'dd.LL.yyyy HH'
export const LUXON_STD_DATE_HOURS_FORMAT_STRING: string = 'yyyy-LL-dd HH'
export const MOMENT_ISO_TIME_FORMAT_STRING: string = 'HH:mm:ssZ'
export const DEFAULT_CORE_URL = 'http://localhost:8079'

export const ROLE_ADMIN: string = 'ROLE_ADMIN'
export const ROLE_DESIGNER: string = 'ROLE_DESIGNER'
export const ROLE_ANALYST: string = 'ROLE_ANALYST'
export const ROLE_PROJECT_MANAGER: string = 'ROLE_PROJECT_MANAGER'
export const ROLE_USER: string = 'ROLE_USER'
export const PASSWORD_PLACEHOLDER = "********"

export const MAIN_DATASOURCE_NAME = 'main'
export const ITEM_TEMPLATE_MODEL_KIND = 'ItemTemplate'
export const ITEM_MODEL_KIND = 'Item'
export const DEFAULT_ITEM_TEMPLATE_NAME = 'default'
export const ACCESS_ITEM_NAME = 'access'
export const ALLOWED_PERMISSION_ITEM_NAME = 'allowedPermission'
export const DATASET_ITEM_NAME = 'dataset'
export const DASHBOARD_ITEM_NAME = 'dashboard'
export const DASHBOARD_CATEGORY_ITEM_NAME = "dashboardCategory"
export const DASHBOARD_CATEGORY_HIERARCHY_ITEM_NAME = "dashboardCategoryHierarchy"
export const DASHBOARD_CATEGORY_MAP_ITEM_NAME = "dashboardCategoryMap"
export const GROUP_ITEM_NAME = 'group'
export const GROUP_MEMBER_ITEM_NAME = 'groupMember'
export const GROUP_ROLE_ITEM_NAME = 'groupRole'
export const IDENTITY_ITEM_NAME = 'identity'
export const ITEM_ITEM_NAME = 'item'
export const ITEM_TEMPLATE_ITEM_NAME = 'itemTemplate'
export const LIFECYCLE_ITEM_NAME = 'lifecycle'
export const MEDIA_ITEM_NAME = 'media'
export const PERMISSION_ITEM_NAME = 'permission'
export const ROLE_ITEM_NAME = 'role'
export const USER_ITEM_NAME = 'user'

export const CONFIG_ID_ATTR_NAME = 'configId'
export const CURRENT_ATTR_NAME = 'current'
export const DATA_SOURCE_ATTR_NAME = 'dataSource'
export const FILENAME_ATTR_NAME = 'filename'
export const ICON_ATTR_NAME = 'icon'
export const ID_ATTR_NAME = 'id'
export const LIFECYCLE_ATTR_NAME = 'lifecycle'
export const LOCALE_ATTR_NAME = 'locale'
export const MAJOR_REV_ATTR_NAME = 'majorRev'
export const MASK_ATTR_NAME = 'mask'
export const MINOR_REV_ATTR_NAME = 'minorRev'
export const PERMISSION_ATTR_NAME = 'permission'
export const STATE_ATTR_NAME = 'state'
export const SOURCE_ATTR_NAME = 'source'
export const TARGET_ATTR_NAME = 'target'
export const USERNAME_ATTR_NAME = 'username'

export enum DndItemType {
    SOURCE_TABLE = 'SOURCE_TABLE'
}