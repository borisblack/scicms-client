# Расширения

SciCMS Client имеет два вида расширений:
- подключаемый модуль - универсальный тип, позволяющий расширять внешний вид и бизнес-логику любых сущностей;
- даш - специализированный тип для визуализации данных в [дашбордах](analytics.md).

Расширения находятся в папке [/src/extensions](/src/extensions).

## Подключаемые модули

Все подключаемые модули находятся в папке [plugins](/src/extensions/plugins).
Подключаемый модуль должен расширять абстрактный класс [Plugin](/src/extensions/plugins/Plugin.ts) и определять его абстрактные методы `onLoad` и `onUnload`.
Метод `onLoad`, как правило, содержит регистрацию пользовательских расширений через соответствующие методы плагина:
- `addRenderer` - регистрирует кастомный компонент;
- `addComponent` - регистрирует кастомный React компонент;
- `addAttributeField` - регистрирует кастомное поле для отрисовки атрибута сущности на форме;
- `addApiMiddleware` - регистрирует кастомную функцию-обработчик операций над сущностью.

Созданный подключаемый модуль должен быть зарегистрирован в файле [plugin.ts](/src/config/plugin.ts).

### Компонент

Основное назначение кастомных компонентов - вывод пользовательской разметки.
Для этого они могут выполнять манипуляции непосредственно с DOM деревом, либо использовать любой из современных фреймворков ([Angular](https://angular.dev), [Vue](https://vuejs.org), [Svelte](https://svelte.dev/) и т.д.).
Кастомный компонент должен имплементировать интерфейс `CustomRenderer`:
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

Поле `mountPount` содержит "точку монтирования" компонента. Поддерживаются следующие значения:
- `default.header` - контент над списком записей;
- `default.content` - контент списка записей;
- `default.footer` - контент под списком записей;
- `<itemName>.default.header` - контент над списком записей типа, заданного в префиксе `<itemName>`;
- `<itemName>.default.content` - контент списка записей типа, заданного в префиксе `<itemName>`;
- `<itemName>.default.footer` - контент под списком записей типа, заданного в префиксе `<itemName>`;
- `view.header` - контент над формой записи;
- `view.content` - контент формы записи;
- `view.footer` - контент под формой записи;
- `<itemName>.view.header` - контент над формой записи типа, заданного в префиксе `<itemName>`;
- `<itemName>.view.content` - контент формы записи типа, заданного в префиксе `<itemName>`;
- `<itemName>.view.footer` - контент под формой записи типа, заданного в префиксе `<itemName>`;
- `tabs.content` - контент вкладок в нижней части формы записи;
- `<itemName>.tabs.content` - контент вкладок в нижней части формы записи типа, заданного в префиксе `<itemName>`.

Поле `priority` определяет приоритет применения кастомного компонента относительно других компонентов, применимых к сущности.

Поле `render` содержит функцию "отрисовки" кастомного компонента, которая принимает два параметра:
- `node` - узел DOM в соответствии с "точкой монтирования";
- `context` - контекст компонента (метаданные и данные сущности).

Простой пример кастомного компонента можно найти в подключаемом модуле [HelloPlugin](/src/extensions/plugins/hello/HelloPlugin.ts).

### React компонент

React компоненты для отрисовки используют библиотеку [React](https://react.dev) и в своей функция `render` возвращают объект типа `ReactNode`.
В остальном они не отличаются от обычных кастомных компонентов.

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
  itemTab: ItemTab
  form?: FormInstance | null
  buffer: IBuffer
  onBufferChange: (buffer: IBuffer) => void
}
```

Точка монтирования в дополнение к списку, перечисленному для кастомных компонентов, может принимать дополнительные значения:
- `view.content.form.begin` - контент перед формой записи;
- `view.content.form.end` - контент после формы записи;
- `<itemName>.view.content.form.begin` - контент перед формой записи типа, заданного в префиксе `<itemName>`;
- `<itemName>.view.content.form.end` - контент после формы записи типа, заданного в префиксе `<itemName>`;
- `tabs.begin` - контент перед первой вкладкой в нижней части формы записи;
- `tabs.end` - контент после последней вкладки в нижней части формы записи;
- `<itemName>.tabs.begin` - контент перед первой вкладкой в нижней части формы записи типа, заданного в префиксе `<itemName>`;
- `<itemName>.tabs.end` - контент после последней вкладки в нижней части формы записи типа, заданного в префиксе `<itemName>`.

Поле `id` React компонента содержит произвольную уникальную (в рамках всех кастомных React компонентов) строку.
Если React компонент в качестве точки монтирования использует вкладку, то он должен содержать поле `title` (локализованная строка заголовка) и (опционально) поле `icon` (значок слева от заголовка).

Примеры React компонентов можно найти во многих подключаемых модулях, например [ItemPlugin](/src/extensions/plugins/item/ItemPlugin.tsx).

### Поле атрибута

Каждый атрибут сущности в SciCMS Client имеет стандартные поля в соответствии с типом атрибута.
Однако, когда необходимо переопределить внешний вид атрибутов, используются кастомные поля.
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

Поле `id` кастомного поля атрибута содержит произвольную уникальную (в рамках всех кастомных полей атрибутов) строку.
Точка монтирования поля атрибута может быть задана двумя путями:
- `<itemName>.<attributeName>` - применяется для атрибута с конкретным именем для конкретной сущности;
- `*.<attributeName>` - применяется для атрибута с конкретным именем для всех сущностей.

Возвращаемым типом функция `render` (также как и в кастомном React компоненте) является `ReactNode`.

Примеры кастомных полей атрибутов можно найти во многих подключаемых модулях, например [ItemPlugin](/src/extensions/plugins/item/ItemPlugin.tsx).

### Обработчик операций

Обработчик операций предназначен для перехвата API-операций над сущностью. Несколько обработчиков могут объединяться в цепочки.
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

Поле `id` обработчика содержит произвольную уникальную (в рамках всех обработчиков) строку.
Поле `itemName` может содержать имя сущности или маску `*` - в этом случае обработчик будет вызываться для всех сущностей.
В функцию `handle` обработчика передается имя операции и контекст с метаданными и данными сущности.

## Даши

Даш предназначен для визуализации данных на дашборде. Все даши находятся в папке [/src/extensions/dashes](/src/extensions/dashes).
Даш должен имплементировать интерфейс `Dash`.
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

Поле `id` содержит уникальную (в рамках всех дашей) строку.
Поле `axes` содержит список с описанием осей даша. Функция `render` даша возвращает объект типа `ReactNode`.
Функция `renderOptionsForm` также возвращает `ReactNode` - форму со специфическими полями даша.

Созданный даш должен быть зарегистрирован в файле [dash.ts](/src/config/dash.ts).

Примеры дашей можно найти в папке [/src/extensions/dashes](/src/extensions/dashes).
