export enum FieldType {
    uuid = 'uuid',
    string = 'string',
    text = 'text',
    sequence = 'sequence',
    email = 'email',
    enum = 'enum',
    password = 'password',
    int = 'int',
    long = 'long',
    float = 'float',
    double = 'double',
    decimal = 'decimal',
    date = 'date',
    time = 'time',
    datetime = 'datetime',
    timestamp = 'timestamp',
    bool = 'bool',
    array = 'array',
    json = 'json',
    media = 'media',
    relation = 'relation'
}

export interface UserInfo {
    id: string
    username: string,
    roles: string[],
    authType: AuthType,
    sessionData: {[key: string]: any} | null
}

export enum AuthType {
    LOCAL = 'LOCAL',
    OAUTH2 = 'OAUTH2'
}

export interface MediaInfo {
    id: string
    filename: string
    description: string | null
    fileSize: number
    mimetype: string
    checksum: string
    createdAt: string
}

export interface PrimitiveFilterInput<T extends string | number | boolean> {
    $null?: boolean
    $notNull?: boolean
    $eq?: T
    $ne?: T
    $gt?: T
    $gte?: T
    $lt?: T
    $lte?: T
    $startsWith?: T
    $endsWith?: T
    $contains?: T
    $containsi?: T
    $notContains?: T
    $notContainsi?: T
    $between?: T[]
    $in?: T[]
    $notIn?: T[]
    $and?: PrimitiveFilterInput<T>[]
    $or?: PrimitiveFilterInput<T>[]
    $not?: PrimitiveFilterInput<T>
}

export enum DeletingStrategy {
    NO_ACTION = 'NO_ACTION',
    SET_NULL = 'SET_NULL',
    CASCADE = 'CASCADE'
}

export interface Pagination {
    page?: number
    pageSize: number
    start?: number
    limit?: number
    total: number
    pageCount?: number
    timeMs?: number
    cacheHit?: boolean
}

export enum ViewState {
    CREATE = 'CREATE',
    CREATE_VERSION = 'CREATE_VERSION',
    CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
    UPDATE = 'UPDATE',
    VIEW = 'VIEW'
}

export interface IBuffer {
    [name: string]: any
}

export interface PaginationInput {
    page?: number
    pageSize?: number
    start?: number,
    limit?: number
}

export enum ViewType {
    default = 'default',
    view = 'view'
}

export interface SecurityConfig {
    oauth2Providers: Oauth2ProviderConfig[]
}

export interface Oauth2ProviderConfig {
    id: string
    name: string
    authUrl: string
    clientId: string
}