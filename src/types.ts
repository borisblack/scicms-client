interface DefaultItemTemplate {
    id: string
    majorRev: string
    minorRev: string | null
    locale: string | null
    lifecycle: Lifecycle | null
    state: string | null
    permission: Permission | null
    createdAt: string
    createdBy: User
    updatedAt: string | null
    updatedBy: User | null
    lockedBy: User | null
}

interface IntermediateItemTemplate {
    sortOrder: number | null
}

interface Lifecycle extends DefaultItemTemplate {
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
    states: {[name: string]: State}
}

interface State {
    displayName: string
    transitions: {[name: string]: Transition}
    point: Point
}

interface Transition {
    displayName?: string
    points: Point[]
}

interface Point {
    x: number
    y: number
}

interface Permission extends DefaultItemTemplate {
    name: string
    access: Access[]
}

interface Access extends DefaultItemTemplate, IntermediateItemTemplate {
    displayName: string | null
    source: Permission
    target: Identity
    mask: number
    beginDate: string
    endDate: string | null
}

interface Identity extends DefaultItemTemplate {
    name: string
    principal: boolean
    access: Access[]
}

interface User extends DefaultItemTemplate {
    username: string
    password: string | null
    enables: boolean | null
}

export interface Item extends DefaultItemTemplate {
    name: string
    tableName: string | null
    displayName: string | null
    displayAttrName: string | null
    singularName: string | null
    pluralName: string,
    description: string | null
    dataSource: string | null
    icon: string | null
    core: boolean | null
    performDdl: boolean | null
    versioned: boolean | null
    manualVersioning: boolean | null
    revisionPolicy: RevisionPolicy | null
    notLockable: boolean | null
    localized: boolean | null
    implementation: string | null
    spec: ItemSpec
    checksum: string | null
    allowedLifecycles: AllowedLifecycle[]
    allowedPermissions: AllowedPermission[]
}

interface RevisionPolicy extends DefaultItemTemplate {
    name: string
    displayName: string | null
    revisions: string | null
}

interface ItemSpec {
    attributes: {[name: string]: Attribute}
    indexes: {[name: string]: Index}
}

export interface Attribute {
    type: AttrType
    columnName?: string
    displayName?: string
    description?: string
    enumSet?: string[]
    seqName?: string
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
    pattern?: string
    length?: number
    precision?: number
    scale?: number
    minRange?: number
    maxRange?: number
    hidden?: boolean
    width?:number
}

export enum AttrType {
    uuid = 'uuid',
    string = 'string',
    text = 'text',
    enum = 'enum',
    sequence = 'sequence',
    email = 'email',
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
    source: Item
    target: Lifecycle
    default: boolean | null
}

interface AllowedPermission extends DefaultItemTemplate, IntermediateItemTemplate {
    source: Item
    target: Permission
}
