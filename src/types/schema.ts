import {FieldType, Pagination, ViewType} from '.'

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

export interface Datasource extends DefaultItemTemplate {
  name: string
  sourceType: DatasourceType
  connectionString: string | null
  username: string | null
  password: string | null
  maxPoolSize: number | null
  minIdle: number | null
  media: Media | null
  params: Record<string, any>
}

export enum DatasourceType {
  DATABASE = 'DATABASE',
  SPREADSHEET = 'SPREADSHEET',
  CSV = 'CSV'
}

export interface Lifecycle extends DefaultItemTemplate {
  name: string
  displayName: string | null
  description: string | null
  icon: string | null
  implementation: string | null
  spec: string
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
  granting: boolean
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
  hash: string | null
}

interface AbstractModel {
  coreVersion: string
  kind: 'ItemTemplate' | 'Item'
  metadata: BaseMetadata
}

interface BaseMetadata {
  name: string
}

export interface ItemTemplateModel extends AbstractModel {
  kind: 'ItemTemplate'
  metadata: ItemTemplateMetadata
  spec: ItemSpec
}

interface ItemTemplateMetadata extends BaseMetadata {
  core: boolean | null
}

export interface Item extends ItemTemplate {
  displayName: string
  pluralName: string
  displayPluralName: string
  datasource: {data: Datasource | null}
  tableName: string | null
  query: string | null
  cacheTtl: number | null
  idAttribute: string
  titleAttribute: string
  defaultSortAttribute: string | null
  defaultSortOrder: string | null
  includeTemplates: string[]
  description: string | null
  icon: string | null
  readOnly: boolean | null
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

interface ItemMetadata extends ItemTemplateMetadata {
  displayName: string
  pluralName: string
  displayPluralName: string
  dataSource: string
  tableName: string | null
  query: string | null
  cacheTtl: number | null
  titleAttribute: string
  defaultSortAttribute: string | null
  defaultSortOrder: string | null
  description: string | null
  icon: string | null
  readOnly: boolean | null
  performDdl: boolean | null
  versioned: boolean | null
  manualVersioning: boolean | null
  localized: boolean | null
  revisionPolicy?: string | null
  lifecycle?: string | null
  permission?: string | null
  implementation: string | null
  notLockable: boolean | null
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
  type: FieldType
  sortOrder?: number
  columnName?: string
  displayName: string
  description?: string
  enumSet?: string[]
  seqName?: string
  confirm?: boolean
  encode?: boolean
  relType?: RelType
  target?: string
  intermediate?: string
  mappedBy?: string
  inversedBy?: string
  referencedBy?: string
  required: boolean
  defaultValue?: string
  keyed: boolean
  unique: boolean
  indexed: boolean
  private: boolean
  readOnly: boolean
  pattern?: string
  format?: string
  length?: number
  precision?: number
  scale?: number
  minRange?: number
  maxRange?: number
  accept?: string
  colHidden?: boolean
  colWidth?: number
  fieldHidden?: boolean
  fieldWidth?: number
}

export interface NamedAttribute extends Attribute {
  name: string
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

export interface AllowedLifecycle extends DefaultItemTemplate, IntermediateItemTemplate {
  source: {data: Item}
  target: {data: Lifecycle}
  default: boolean | null
}

export interface AllowedPermission extends DefaultItemTemplate, IntermediateItemTemplate {
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

export interface Locale extends DefaultItemTemplate {
  name: string
  displayName: string | null
}

export interface Locale extends DefaultItemTemplate {
  name: string
  displayName: string | null
}

export type PropertyType =
  | FieldType.uuid
  | FieldType.string
  | FieldType.text
  | FieldType.email
  | FieldType.int
  | FieldType.long
  | FieldType.float
  | FieldType.double
  | FieldType.decimal
  | FieldType.date
  | FieldType.time
  | FieldType.datetime
  | FieldType.timestamp
  | FieldType.bool
  | FieldType.array
  | FieldType.json

export enum PropertyScope {
  client = 'client',
  server = 'server'
}

export interface Property extends DefaultItemTemplate {
  name: string
  type: PropertyType
  value: string | null
  scope: PropertyScope | null
}

export interface ItemData extends DefaultItemTemplate {
  [name: string]: any
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

export interface ItemDataWrapper {
  item: Item
  viewType: ViewType
  id?: string
  data?: ItemData
  extra?: Record<string, any>
}
