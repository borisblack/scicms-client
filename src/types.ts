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
    implementation: string | null
    spec: string
    checksum: string | null
}

export interface LifecycleSpec {
    startEvent: State
    states: StateMap
}

export interface StateMap {
    [name: string]: State
}

export interface State {
    transitions: string[]
}

export interface Permission extends DefaultItemTemplate {
    name: string
    accesses: {data: Access[]}
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
    accesses: {data: Access[]}
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

export interface ItemTemplate extends DefaultItemTemplate {
    name: string
    core: boolean | null
    spec: ItemSpec
    checksum: string | null
    hash: string | null
}

interface AbstractModel {
    coreVersion: string
    kind: 'ItemTemplate' | 'Item'
    metadata: BaseMetadata
    checksum?: string | null
}

interface BaseMetadata {
    name: string
}

export interface ItemTemplateModel extends AbstractModel{
    kind: 'ItemTemplate'
    metadata: ItemTemplateMetadata
    spec: ItemSpec
}

interface ItemTemplateMetadata extends BaseMetadata{
    core: boolean | null
}

export interface Item extends ItemTemplate {
    displayName: string
    pluralName: string
    displayPluralName: string
    dataSource: string
    tableName: string
    titleAttribute: string
    includeTemplates: string[]
    description: string | null
    icon: string | null
    performDdl: boolean | null
    versioned: boolean | null
    manualVersioning: boolean | null
    revisionPolicy: {data: RevisionPolicy | null}
    notLockable: boolean | null
    localized: boolean | null
    implementation: string | null
    allowedLifecycles: {data: AllowedLifecycle[]}
    allowedPermissions: {data: AllowedPermission[]}
}

export interface ItemModel extends AbstractModel {
    kind: 'Item'
    includeTemplates: string[]
    metadata: ItemMetadata
    spec: ItemSpec
}

interface ItemMetadata extends ItemTemplateMetadata{
    displayName: string
    pluralName: string
    displayPluralName: string
    dataSource: string,
    tableName: string
    titleAttribute: string
    description: string | null
    icon: string | null
    performDdl: boolean | null
    versioned: boolean | null
    manualVersioning: boolean | null
    localized: boolean | null
    revisionPolicy?: string | null
    lifecycle?: string | null
    permission?: string | null
    implementation: string | null
    notLockable: boolean |null
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

export interface NamedAttribute extends Attribute {
    name: string
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

export interface Index {
    columns: string[]
    unique: boolean
}

export interface NamedIndex extends Index {
    name: string
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

export interface Dashboard extends DefaultItemTemplate {
    name: string
    displayName: string | null
    spec: IDashboardSpec
    checksum: string | null
}

export interface IDashboardSpec {
    dashes: IDash[]
}

export interface IDash {
    name: string
    type: DashType
    x: number
    y: number
    w: number
    h: number
    refreshIntervalSeconds: number
    metricType: MetricType
    temporalType?: TemporalType
    datasets: Dataset[]
}

export type NumericType = AttrType.int | AttrType.long | AttrType.float | AttrType.double | AttrType.decimal

export type TemporalType = AttrType.date | AttrType.time | AttrType.datetime | AttrType.timestamp

export type MetricType = NumericType | TemporalType | AttrType.bool

export enum DashType {
    bar = 'bar'
}

export interface Dataset {
    itemName?: string
    label?: string
    metric?: string
    location?: string
    temporal?: string
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

export enum ViewState {
    CREATE = 'CREATE',
    CREATE_VERSION = 'CREATE_VERSION',
    CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
    UPDATE = 'UPDATE',
    VIEW = 'VIEW'
}

export interface IBuffer {
    form: {[key: string]: any}
    [key: string]: any
}
