# Extensions

SciCMS Client has two types of extensions:
- plugin - an universal type that allows us to expand the appearance and business logic of any Items;
- dash - a specialized type for data visualization in [dashboards](analytics.md).

Extensions are located in the [/src/extensions](/src/extensions) folder.

## Plugins

All plugins are located in the [plugins](/src/extensions/plugins) folder.
The plugin must extend the abstract class [Plugin](/src/extensions/plugins/Plugin.ts) and define its abstract methods `onLoad` and `onUnload`.
The `onLoad` method typically contains registration of custom extensions through the corresponding plugin methods:
- `addRenderer` - registers a custom renderer;
- `addComponent` - registers a custom React component;
- `addAttributeField` - registers a custom field for drawing an Item attribute on the form;
- `addApiMiddleware` - registers a custom function handler for operations on an Item.

The created plugin must be registered in the [plugin.ts](/src/config/plugin.ts) file.

### Renderer

The main purpose of custom renderers is to display custom markup.
To do this, they can perform manipulations directly with the DOM tree, or use any of the modern frameworks ([Angular](https://angular.dev), [Vue](https://vuejs.org), [Svelte](https: //svelte.dev/) etc.).
The custom renderer must implement the `CustomRenderer` interface:
```typescript
export interface CustomRenderer {
  mountPoint: CustomRendererMountPoint
  priority?: number
  render: (props: CustomRendererProps) => void
}

export type CustomRendererMountPoint = string |
 'default.header' |
 'default.content' |
 'default.footer' |
 'view.header' |
 'view.footer' |
 'view.content' |
 'tabs.content'

export interface CustomRendererProps {
  node: HTMLElement
  context: CustomRendererContext
}

export interface CustomRendererContext {
  item: Item
  buffer: IBuffer
  data?: ItemData | null
  onBufferChange: (buffer: IBuffer) => void
}
```

The `mountPount` field contains the "mount point" of the component. The following values ​​are supported:
- `default.header` - content above the list of records;
- `default.content` - content of the list of records;
- `default.footer` - content under the list of records;
- `<itemName>.default.header` - content above the list of records of the type specified in the prefix `<itemName>`;
- `<itemName>.default.content` - content of the list of records of the type specified in the prefix `<itemName>`;
- `<itemName>.default.footer` - content under the list of records of the type specified in the prefix `<itemName>`;
- `view.header` - content above the record form;
- `view.content` - record form content;
- `view.footer` - content under the record form;
- `<itemName>.view.header` - content above the record form of the type specified in the `<itemName>` prefix;
- `<itemName>.view.content` - content of the record type form specified in the `<itemName>` prefix;
- `<itemName>.view.footer` - content under the form of a record of the type specified in the prefix `<itemName>`;
- `tabs.content` - content of the tabs at the bottom of the record form;
- `<itemName>.tabs.content` - content of the tabs at the bottom of the record form of the type specified in the `<itemName>` prefix.

The `priority` field determines the priority of applying the custom component relative to other components applicable to the Item.

The `render` field contains the rendering function of the custom component, which takes two parameters:
- `node` - DOM node in accordance with the mount point;
- `context` - component context (Item metadata and record data).

A simple example of a custom renderer can be found in the [HelloPlugin](/src/extensions/plugins/hello/HelloPlugin.ts) plugin.

### Custom component

Custom components for rendering use the [React](https://react.dev) library and in their `render` function they return an object of type `ReactNode`.
Otherwise, they are no different from regular custom renderers.

```typescript
export interface CustomComponent {
  id: string
  mountPoint: CustomComponentMountPoint
  priority?: number
  title?: string // for tabs rendering
  icon?: string // for tabs rendering
  render: ({context}: CustomComponentProps) => ReactNode
}

export type CustomComponentMountPoint = CustomRendererMountPoint |
  'view.content.form.begin' |
  'view.content.form.end' |
  'tabs.content' |
  'tabs.begin' |
  'tabs.end'

export interface CustomComponentProps {
  context: CustomComponentContext
}

export interface CustomComponentContext {
  data: ItemDataWrapper
  form?: FormInstance | null
  buffer: IBuffer
  onBufferChange: (buffer: IBuffer) => void
}
```

The mount point, in addition to the list listed for custom components, can take additional values:
- `view.content.form.begin` - content before the record form;
- `view.content.form.end` - content after the record form;
- `<itemName>.view.content.form.begin` - content before the record form of the type specified in the `<itemName>` prefix;
- `<itemName>.view.content.form.end` - content after the record form of the type specified in the `<itemName>` prefix;
- `tabs.begin` - content before the first tab at the bottom of the record form;
- `tabs.end` - content after the last tab at the bottom of the record form;
- `<itemName>.tabs.begin` - content before the first tab at the bottom of the form of a record of the type specified in the `<itemName>` prefix;
- `<itemName>.tabs.end` - content after the last tab at the bottom of the form of the record type specified in the `<itemName>` prefix.

The `id` field of a custom component contains an arbitrary unique (within all custom custom components) string.
If a custom component uses a tab as its mount point, it must contain a `title` field (localized title bar) and (optionally) an `icon` field (the icon to the left of the title).

Examples of custom components can be found in many plugins, for example [ItemPlugin](/src/extensions/plugins/item/ItemPlugin.tsx).

### Attribute field

Each Item attribute in SciCMS Client has standard fields according to the attribute type.
However, when it is necessary to override the appearance of attributes, custom fields are used.
```typescript
export interface CustomAttributeField {
  id: string
  mountPoint: CustomAttributeFieldMountPoint
  render: ({context}: CustomAttributeFieldProps) => ReactNode
}

export type CustomAttributeFieldMountPoint = string

export interface CustomAttributeFieldProps {
  context: CustomAttributeFieldContext
}

export interface CustomAttributeFieldContext extends AttributeFieldProps {}
```

The `id` field of a custom attribute field contains an arbitrary unique (within all custom attribute fields) string.
The mount point of an attribute field can be specified in two ways:
- `<itemName>.<attributeName>` - used for an attribute with a specific name for a specific Item;
- `*.<attributeName>` - used for an attribute with a specific name for all Items.

The return type of the `render` function (as well as in a custom React component) is `ReactNode`.

Examples of custom attribute fields can be found in many plugins, for example [ItemPlugin](/src/extensions/plugins/item/ItemPlugin.tsx).

### API Middleware

The middleware is designed to intercept API operations on an Item record. Several handlers can be chained together.
```typescript
export interface ApiMiddleware {
  id: string
  itemName: string | '*'
  priority?: number
  handle: (operation: ApiOperation, context: ApiMiddlewareContext, next: () => any) => any
}

export enum ApiOperation {
  FIND = 'FIND',
  FIND_ALL = 'FIND_ALL',
  CREATE = 'CREATE',
  CREATE_VERSION = 'CREATE_VERSION',
  CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
  UPDATE = 'UPDATE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  DELETE = 'DELETE',
  PURGE = 'PURGE',
  PROMOTE = 'PROMOTE'
}

export interface ApiMiddlewareContext {
  me: UserInfo | null
  items: ItemMap
  item: Item
  buffer: IBuffer
  values: any
}
```

The `id` field contains an arbitrary unique (within all handlers) string.
The `itemName` field can contain the Item name or the `*` mask - in this case the handler will be called for all Items.
The `handle` function is passed the name of the operation and the context with Item metadata and record data.

## Dashes

Dash is designed to visualize data on a dashboard. All dashes are located in the folder [/src/extensions/dashes](/src/extensions/dashes).
Dash must implement the `Dash` interface.
```typescript
export interface Dash {
  id: string
  axes: IDashAxis[]
  renderOptionsForm: (props: DashOptionsFormProps) => ReactNode
  icon?: string
  height?: number
  render: (props: DashRenderProps) => ReactNode
}

interface IDashAxis {
    name: string
    label: string
    cardinality: number
    required: boolean
}

export interface DashOptionsFormProps {
    dataset: Dataset
    availableColNames: string[]
    fieldName: string
    form: FormInstance
    values: {[key: string]: any}
}

interface DashProps extends DashWrapperProps {
    dataset: Dataset
}

interface DashRenderProps {
    context: DashRenderContext
}
```

The `id` field contains a unique (within all dashas) string.
The `axes` field contains a list with a description of the dasa axes. The `render` function returns an object of type `ReactNode`.
The `renderOptionsForm` function also returns a `ReactNode` - a form with dash-specific fields.

The created dash must be registered in the file [dash.ts](/src/config/dash.ts).

Examples of dashes can be found in the folder [/src/extensions/dashes](/src/extensions/dashes).
