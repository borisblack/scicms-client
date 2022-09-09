export interface UserInfo {
    id: string
    username: string,
    roles: string[]
}

export interface DefaultItemTemplate {
    id: string
    configId: string
    majorRev: string
    minorRev: string | null
    current: boolean
    locale: string | null
    lifecycle: {data: Lifecycle | null}
    state: string | null
    permission: {data: Permission | null}
    createdAt: string
    createdBy: {data: User}
    updatedAt: string | null
    updatedBy: {data: User | null}
    lockedBy: {data: User | null}
}

interface IntermediateItemTemplate {
    sortOrder: number | null
}

export interface Lifecycle extends DefaultItemTemplate {
    name: string
    displayName: string | null
    description: string | null
    icon: string | null
    startState: string
    implementation: string | null
    spec: LifecycleSpec
    checksum: string | null
}

interface LifecycleSpec {
    states: StateMap
}

export interface StateMap {
    [name: string]: State
}

export interface State {
    displayName: string
    transitions: TransitionMap
    point: Point
}

export interface TransitionMap {
    [name: string]: Transition
}

interface Transition {
    displayName?: string
    points: Point[]
}

interface Point {
    x: number
    y: number
}

export interface Permission extends DefaultItemTemplate {
    name: string
    access: {data: Access[]}
}

export interface Access extends DefaultItemTemplate, IntermediateItemTemplate {
    label: string | null
    source: {data: Permission}
    target: {data: Identity}
    mask: number
    beginDate: string
    endDate: string | null
}

interface Identity extends DefaultItemTemplate {
    name: string
    principal: boolean
    access: {data: Access[]}
}

interface User extends DefaultItemTemplate {
    username: string
    password: string | null
    enables: boolean | null
}

export interface ItemTemplate extends DefaultItemTemplate {
    name: string
    core: boolean | null
    spec: ItemSpec
}

export interface Item extends DefaultItemTemplate {
    name: string
    displayName: string
    pluralName: string
    displayPluralName: string
    dataSource: string
    tableName: string
    titleAttribute: string
    includeTemplates: string[]
    description: string | null
    icon: string | null
    core: boolean | null
    performDdl: boolean | null
    versioned: boolean | null
    manualVersioning: boolean | null
    revisionPolicy: {data: RevisionPolicy | null}
    notLockable: boolean | null
    localized: boolean | null
    implementation: string | null
    spec: ItemSpec
    checksum: string | null
    allowedLifecycles: {data: AllowedLifecycle[]}
    allowedPermissions: {data: AllowedPermission[]}
}

export interface Sequence extends DefaultItemTemplate {
    name: string
    displayName: string
    prefix: string | null
    suffix: string | null
    initialValue: number
    currentValue: number | null
    step: number
    padWith: string | null
    padTo: number | null
}

interface RevisionPolicy extends DefaultItemTemplate {
    name: string
    displayName: string | null
    revisions: string | null
}

export interface ItemSpec {
    attributes: {[name: string]: Attribute}
    indexes: {[name: string]: Index}
}

export interface Attribute {
    type: AttrType
    columnName?: string
    displayName: string
    description?: string
    enumSet?: string[]
    seqName?: string
    confirm?: boolean
    relType?: RelType
    target?: string
    intermediate?: string
    mappedBy?: string
    inversedBy?: string
    required: boolean
    defaultValue?: string
    keyed: boolean
    unique: boolean
    indexed: boolean
    private: boolean
    readOnly: boolean
    pattern?: string
    length?: number
    precision?: number
    scale?: number
    minRange?: number
    maxRange?: number
    colHidden?: boolean
    colWidth?: number
    fieldHidden?: boolean
    fieldWidth?: number
}

export enum AttrType {
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
    location = 'location',
    relation = 'relation'
}

export enum RelType {
    oneToOne = 'oneToOne',
    oneToMany = 'oneToMany',
    manyToOne = 'manyToOne',
    manyToMany = 'manyToMany'
}

interface Index {
    columns: string[]
    unique: boolean
}

interface AllowedLifecycle extends DefaultItemTemplate, IntermediateItemTemplate {
    source: {data: Item}
    target: {data: Lifecycle}
    default: boolean | null
}

interface AllowedPermission extends DefaultItemTemplate, IntermediateItemTemplate {
    source: {data: Item}
    target: {data: Permission}
}

export interface Media extends DefaultItemTemplate {
    filename: string
    label: string | null
    description: string | null
    fileSize: number
    mimeType: string
    path: string
    checksum: string
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

export interface Location extends DefaultItemTemplate {
    latitude: number
    longitude: number
    label: string
    sortOrder: number | null
}

export interface Locale extends DefaultItemTemplate {
    name: string
    displayName: string | null
}

export interface ItemData extends DefaultItemTemplate {
    [name: string]: any
}

export enum DeletingStrategy {
    NO_ACTION = 'NO_ACTION',
    SET_NULL = 'SET_NULL',
    CASCADE = 'CASCADE'
}

export interface Response {
    data: ItemData
}

export interface FlaggedResponse {
    success: boolean
    data: ItemData
}

export interface ResponseCollection<T extends ItemData> {
    data: T[]
    meta: ResponseCollectionMeta
}

interface ResponseCollectionMeta {
    pagination: Pagination
}

interface Pagination {
    limit?: number
    page: number
    pageCount?: number
    pageSize: number
    start?: number
    total: number
}

export enum Operation {
    CREATE = 'CREATE',
    CREATE_VERSION = 'CREATE_VERSION',
    CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
    UPDATE = 'UPDATE',
    VIEW = 'VIEW'
}
