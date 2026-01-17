import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Col, Collapse, Form, Modal, notification, Row, Spin, Tabs} from 'antd'
import {Tab} from 'rc-tabs/lib/interface'
import {FieldType, IBuffer, ViewState} from 'src/types'
import {Attribute, ItemData, ItemTab, RelType} from 'src/types/schema'
import {useTranslation} from 'react-i18next'
import AttributeFieldWrapper from './AttributeFieldWrapper'
import {filterValues, parseValues} from 'src/util/form'
import ViewNavTabHeader from './ViewNavTabHeader'
import {
  ANTD_GRID_COLS,
  CONFIG_ID_ATTR_NAME,
  CURRENT_ATTR_NAME,
  DEBUG,
  ITEM_ITEM_NAME,
  ITEM_TEMPLATE_ITEM_NAME,
  LOCALE_ATTR_NAME,
  MAJOR_REV_ATTR_NAME,
  MINOR_REV_ATTR_NAME
} from 'src/config/constants'
import RelationsDataGridWrapper from './RelationsDataGridWrapper'
import {exportWinFeatures, exportWinStyle, renderValue} from 'src/util/export'
import {useAppProperties, useAuth, useFormAcl, useMutationManager, useQueryManager, useRegistry} from 'src/util/hooks'
import {useMDIContext} from 'src/uiKit/MDITabs/hooks'
import {generateKey} from 'src/util/mdi'
import IconSuspense from 'src/uiKit/icons/IconSuspense'
import {
  hasCurrentAttribute,
  hasGenerationAttribute,
  hasLocaleAttribute,
  hasMajorRevAttribute,
  isItemLockable,
  sortAttributes
} from 'src/util/schema'
import {
  ApiMiddlewareContext,
  ApiOperation,
  CustomComponentContext,
  CustomRendererContext
} from 'src/extensions/plugins/types'
import {pluginEngine} from 'src/extensions/plugins'
import {clientConfig} from 'src/config'

interface Props {
  itemTab: ItemTab
}

const {confirm} = Modal

function ViewNavTab({itemTab}: Props) {
  const {me, logout} = useAuth()
  const {coreConfig, items: itemMap, itemTemplates, reset: resetRegistry} = useRegistry()
  const ctx = useMDIContext<ItemTab>()
  const {item, data} = itemTab
  const isNew = !data?.id
  const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const [loading, setLoading] = useState<boolean>(false)
  const isLockable = isItemLockable(item)
  const [isLockedByMe, setLockedByMe] = useState<boolean>(
    me?.id != null && (!isLockable || data?.lockedBy?.data?.id === me.id)
  )
  const [viewState, setViewState] = useState<ViewState>(
    isNew
      ? ViewState.CREATE
      : isLockedByMe
        ? item.versioned
          ? ViewState.CREATE_VERSION
          : ViewState.UPDATE
        : ViewState.VIEW
  )
  const [buffer, setBuffer] = useState<IBuffer>({})
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentFormRef = useRef<HTMLDivElement>(null)
  const tabsContentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()
  const queryManager = useQueryManager()
  const mutationManager = useMutationManager()
  const acl = useFormAcl(item, data)
  const handleBufferChange = useCallback((bufferChanges: IBuffer) => setBuffer({...buffer, ...bufferChanges}), [buffer])
  const renderContext: CustomRendererContext = useMemo(
    () => ({
      item,
      buffer,
      data,
      onBufferChange: handleBufferChange
    }),
    [buffer, data, handleBufferChange, item]
  )

  const customComponentContext: CustomComponentContext = useMemo(
    () => ({
      itemTab,
      form,
      buffer,
      onBufferChange: handleBufferChange
    }),
    [itemTab, form, buffer, handleBufferChange]
  )

  useEffect(() => {
    if (DEBUG) console.log('ViewNavTab buffer and fields reset')

    setBuffer({})
    form.resetFields()
  }, [form, data])

  useEffect(() => {
    const headerNode = headerRef.current
    if (headerNode) {
      pluginEngine.render('view.header', headerNode, renderContext)
      pluginEngine.render(`${item.name}.view.header`, headerNode, renderContext)
    }

    const contentNode = contentRef.current
    if (contentNode) {
      pluginEngine.render('view.content', contentNode, renderContext)
      pluginEngine.render(`${item.name}.view.content`, contentNode, renderContext)
    }

    const contentFormNode = contentFormRef.current
    if (contentFormNode) {
      pluginEngine.render('view.content.form', contentFormNode, renderContext)
      pluginEngine.render(`${item.name}.view.content,form`, contentFormNode, renderContext)
    }

    const footerNode = footerRef.current
    if (footerNode) {
      pluginEngine.render('view.footer', footerNode, renderContext)
      pluginEngine.render(`${item.name}.view.footer`, footerNode, renderContext)
    }

    const tabsContentNode = tabsContentRef.current
    if (tabsContentNode) {
      pluginEngine.render('tabs.content', tabsContentNode, renderContext)
      pluginEngine.render(`${item.name}.tabs.content`, tabsContentNode, renderContext)
    }
  }, [item.name, renderContext])

  const handleLogout = useCallback(async () => {
    await logout()
    ctx.reset()
    resetRegistry()
  }, [ctx, logout, resetRegistry])

  const logoutIfNeed = useCallback(() => {
    if (!isSystemItem) return

    confirm({
      title: `${t('You must sign in again to apply the changes')}`,
      onOk: handleLogout
    })
  }, [isSystemItem, handleLogout, t])

  async function handleFormFinish(values: any) {
    if (DEBUG) {
      console.log('Values', values)
      console.log('Buffer', buffer)
    }

    let parsedValues: ItemData
    try {
      parsedValues = await parseValues({
        itemMap,
        item,
        data,
        values: {...values, ...buffer},
        timezone: appProps.dateTime.timeZone
      })
      if (DEBUG) console.log('Parsed values', parsedValues)
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Parsing error'),
        description: e.message
      })
      return
    }

    if (DEBUG) console.log('ViewState', viewState)

    const filteredValues = filterValues(parsedValues)
    switch (viewState) {
      case ViewState.CREATE:
        await create(
          filteredValues,
          item.manualVersioning ? parsedValues.majorRev : null,
          item.localized ? parsedValues.locale : null
        )
        break
      case ViewState.CREATE_VERSION:
        await createVersion(
          filteredValues,
          item.manualVersioning ? parsedValues.majorRev : null,
          item.localized ? parsedValues.locale : null
        )
        break
      case ViewState.CREATE_LOCALIZATION:
        if (!parsedValues.locale) throw new Error('Locale is required')

        await createLocalization(filteredValues, parsedValues.locale)
        break
      case ViewState.UPDATE:
        await update(filteredValues)
        break
      case ViewState.VIEW:
      default:
        break
    }
  }

  async function create(values: ItemData, majorRev?: string | null, locale?: string | null) {
    if (!acl.canCreate) throw new Error('Cannot create such item')

    setLoading(true)
    try {
      const doCreate = async () => await mutationManager.create(item, values, majorRev, locale)
      let created: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
        created = await pluginEngine.handleApiMiddleware(item.name, ApiOperation.CREATE, apiMiddlewareContext, doCreate)
      } else {
        created = await doCreate()
      }
      const createdDataWrapper: ItemTab = {...itemTab, data: created}
      ctx.updateActiveTab(createdDataWrapper, generateKey(createdDataWrapper))

      if (isLockable) {
        setLockedByMe(false)
        setViewState(ViewState.VIEW)
      }

      logoutIfNeed()
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Creation error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function createVersion(values: ItemData, majorRev?: string | null, locale?: string | null) {
    if (!acl.canCreate) throw new Error('Cannot edit this item')

    if (!item.versioned || !hasMajorRevAttribute(item) || !hasGenerationAttribute(item) || !hasCurrentAttribute(item))
      throw new Error('Item is not versioned')

    if (isNew) throw new Error('Cannot create version for new item')

    setLoading(true)
    try {
      const doCreateVersion = async () =>
        await mutationManager.createVersion(
          item,
          data[item.idAttribute],
          values,
          majorRev,
          locale,
          appProps.mutation.copyCollectionRelations
        )
      let createdVersion: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
        createdVersion = await pluginEngine.handleApiMiddleware(
          item.name,
          ApiOperation.CREATE_VERSION,
          apiMiddlewareContext,
          doCreateVersion
        )
      } else {
        createdVersion = await doCreateVersion()
      }
      const createdVersionDataWrapper: ItemTab = {...itemTab, data: createdVersion}
      ctx.updateActiveTab(createdVersionDataWrapper, generateKey(createdVersionDataWrapper))

      if (isLockable) {
        setLockedByMe(false)
        setViewState(ViewState.VIEW)
      }
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Version creation error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function createLocalization(values: ItemData, locale: string) {
    if (!acl.canCreate) throw new Error('Cannot edit this item')

    if (!item.localized || !hasLocaleAttribute(item)) throw new Error('Item is not localized')

    if (isNew) throw new Error('Cannot create localization for new item')

    setLoading(true)
    try {
      const doCreateLocalization = async () =>
        await mutationManager.createLocalization(
          item,
          data[item.idAttribute],
          values,
          locale,
          appProps.mutation.copyCollectionRelations
        )
      let createdLocalization: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
        createdLocalization = await pluginEngine.handleApiMiddleware(
          item.name,
          ApiOperation.CREATE_LOCALIZATION,
          apiMiddlewareContext,
          doCreateLocalization
        )
      } else {
        createdLocalization = await doCreateLocalization()
      }
      const createdLocalizationDataWrapper: ItemTab = {...itemTab, data: createdLocalization}
      ctx.updateActiveTab(createdLocalizationDataWrapper, generateKey(createdLocalizationDataWrapper))

      if (isLockable) {
        setLockedByMe(false)
        setViewState(ViewState.VIEW)
      }
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Localization creation error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function update(values: ItemData) {
    if (!acl.canWrite) throw new Error('Cannot edit this item')

    if (isNew) throw new Error('New item cannot be updated')

    setLoading(true)
    try {
      const doUpdate = async () => await mutationManager.update(item, data[item.idAttribute], values)
      let updated: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
        updated = await pluginEngine.handleApiMiddleware(item.name, ApiOperation.UPDATE, apiMiddlewareContext, doUpdate)
      } else {
        updated = await doUpdate()
      }
      ctx.updateActiveTab({...itemTab, data: updated})

      if (isLockable) {
        setLockedByMe(false)
        setViewState(ViewState.VIEW)
      }

      logoutIfNeed()
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Update error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  const filterVisibleAttributeNames = useCallback(
    (attributes: {[name: string]: Attribute}): string[] =>
      Object.keys(attributes).filter(attrName => {
        const attr = attributes[attrName]
        return (
          !attr.private &&
          /*&& !attr.fieldHidden*/
          (attr.type !== FieldType.relation ||
            (attr.relType !== RelType.oneToMany && attr.relType !== RelType.manyToMany)) &&
          (item.versioned ||
            (attrName !== CONFIG_ID_ATTR_NAME &&
              attrName !== MAJOR_REV_ATTR_NAME &&
              attrName !== MINOR_REV_ATTR_NAME &&
              attrName !== CURRENT_ATTR_NAME)) &&
          (item.localized || attrName !== LOCALE_ATTR_NAME)
        )
      }),
    [item.localized, item.versioned]
  )

  const renderAttributes = (attributes: {[name: string]: Attribute}) => (
    <Row gutter={16}>
      {filterVisibleAttributeNames(attributes).map(attrName => {
        const attr = attributes[attrName]
        const {fieldWidth} = attr
        const span =
          fieldWidth == null || fieldWidth <= 0 || fieldWidth > ANTD_GRID_COLS
            ? appProps.ui.form.fieldWidth
            : fieldWidth
        const attributeContent = (
          <AttributeFieldWrapper
            key={attrName}
            itemTab={itemTab}
            form={form}
            attrName={attrName}
            attribute={attr}
            value={data ? data[attrName] : null}
            setLoading={setLoading}
            onChange={(value: any) => handleFieldChange(attrName, value)}
          />
        )

        return attr.fieldHidden ? (
          attributeContent
        ) : (
          <Col span={span} key={attrName}>
            {attributeContent}
          </Col>
        )
      })}
    </Row>
  )

  async function handleFieldChange(attrName: string, value: any) {
    if (attrName === LOCALE_ATTR_NAME) {
      if (!item.localized) throw new Error('Illegal state. Cannot change locale on non localized item')

      if (!value) return

      if (viewState !== ViewState.UPDATE && viewState !== ViewState.CREATE_VERSION) return

      if (isNew || (data.locale ?? coreConfig?.i18n?.defaultLocale) === value) return

      setLoading(true)
      try {
        const existingLocalization = await queryManager.findLocalization(item, data.configId, data.majorRev, value)
        if (existingLocalization) {
          if (viewState === ViewState.UPDATE) setViewState(ViewState.CREATE_LOCALIZATION)

          ctx.updateActiveTab({...itemTab, data: existingLocalization})
        } else {
          setViewState(ViewState.CREATE_LOCALIZATION)
        }
      } catch (e: any) {
        console.error(e.message)
        notification.error({
          message: t('Localization search error'),
          description: e.message,
          duration: clientConfig.notification.duration,
          placement: clientConfig.notification.placement
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const templateAttributes = useMemo(() => {
    let templateAttributes: {[name: string]: Attribute} = {}
    for (const itemTemplateName of item.includeTemplates) {
      const itemTemplate = itemTemplates[itemTemplateName]
      templateAttributes = {...templateAttributes, ...itemTemplate.spec.attributes}
    }
    return sortAttributes(templateAttributes)
  }, [item.includeTemplates, itemTemplates])

  const ownAttributes = useMemo(() => {
    const allAttributes = item.spec.attributes
    const ownAttributes: {[name: string]: Attribute} = {}
    for (const attrName in allAttributes) {
      if (!(attrName in templateAttributes)) ownAttributes[attrName] = allAttributes[attrName]
    }
    return sortAttributes(ownAttributes)
  }, [item.spec.attributes, templateAttributes])

  const handleHtmlExport = useCallback(() => {
    if (!data) return

    const {attributes} = item.spec
    const visibleAttributeNames = filterVisibleAttributeNames(attributes)

    /* eslint-disable */
    const exportWinHtml = `<!DOCTYPE html>
      <html>
          <head>
              <title>${t(item.displayName)}</title>
              <style>
                  ${exportWinStyle}
              </style>
          </head>
          <body>
              <h2>${t(item.displayName)}</h2>
              <table>
                <tbody>
                    ${visibleAttributeNames.map(attrName => {
                      const attribute = attributes[attrName]
                      return `<tr><td style="font-weight: 600">${t(attribute.displayName)}</td><td>${renderValue(data[attrName])}</td></tr>`
                    }).join('')}
                </tbody>
              </table>
          </body>
      </html>`
    /* eslint-enable */

    // const exportWinUrl = URL.createObjectURL(new Blob([exportWinHtml], { type: "text/html" }))
    const exportWin = window.open('', 'Export HTML', exportWinFeatures) as Window
    exportWin.document.body.innerHTML = exportWinHtml
  }, [data, filterVisibleAttributeNames, item.displayName, item.spec, t])

  const getComponentTabs = useCallback(
    (mountPoint: string): Tab[] =>
      pluginEngine.getComponents(mountPoint).map(component => {
        const title = t(component.title ?? 'Untitled')
        return {
          key: component.id,
          label: (
            <span>
              <IconSuspense iconName={component.icon} />
              &nbsp;{title}
            </span>
          ),
          children: component.render({context: customComponentContext})
        }
      }),
    [customComponentContext, t]
  )

  const getTabs = useCallback(
    (collectionAttrNames: string[]): Tab[] => {
      const tabs: Tab[] = []
      if (pluginEngine.hasComponents('tabs.begin')) tabs.push(...getComponentTabs('tabs.begin'))

      if (pluginEngine.hasComponents(`${item.name}.tabs.begin`))
        tabs.push(...getComponentTabs(`${item.name}.tabs.begin`))

      if (!isNew) {
        tabs.push(
          ...collectionAttrNames.map(key => {
            const attribute = item.spec.attributes[key]
            if (!attribute.target) throw new Error('Illegal attribute target')

            const target = itemMap[attribute.target]
            const title = t(attribute.displayName)
            return {
              key: key,
              label: (
                <span>
                  <IconSuspense iconName={target.icon} />
                  {title}
                </span>
              ),
              children: <RelationsDataGridWrapper itemTab={itemTab} relAttrName={key} relAttribute={attribute} />
            }
          })
        )
      }

      if (pluginEngine.hasComponents('tabs.end')) tabs.push(...getComponentTabs('tabs.end'))

      if (pluginEngine.hasComponents(`${item.name}.tabs.end`)) tabs.push(...getComponentTabs(`${item.name}.tabs.end`))

      return tabs
    },
    [getComponentTabs, item, isNew, itemMap, t, itemTab]
  )

  const renderTabs = useCallback(() => {
    const hasTabsContentPlugins = pluginEngine.hasRenderers('tabs.content', `${item.name}.tabs.content`)
    const hasTabsContentPluginsOrComponents =
      hasTabsContentPlugins || pluginEngine.hasComponents('tabs.content', `${item.name}.tabs.content`)

    const hasTabsPluginsOrComponents =
      hasTabsContentPluginsOrComponents ||
      pluginEngine.hasComponents('tabs.begin', `${item.name}.tabs.begin`, 'tabs.end', `${item.name}.tabs.end`)

    if (isNew && !hasTabsPluginsOrComponents) return null

    const collectionAttrNames = Object.keys(item.spec.attributes).filter(key => {
      const attribute = item.spec.attributes[key]
      return (
        attribute.type === FieldType.relation &&
        (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany) &&
        !attribute.private &&
        !attribute.fieldHidden
      )
    })

    const hasTabs =
      !hasTabsContentPluginsOrComponents &&
      (collectionAttrNames.length > 0 ||
        pluginEngine.hasComponents('tabs.begin', `${item.name}.tabs.begin`, 'tabs.end', `${item.name}.tabs.end`))

    return (
      <>
        {pluginEngine.hasComponents('tabs.content') &&
          pluginEngine.renderComponents('tabs.content', customComponentContext)}
        {pluginEngine.hasComponents(`${item.name}.tabs.content`) &&
          pluginEngine.renderComponents(`${item.name}.tabs.content`, customComponentContext)}
        {hasTabsContentPlugins && <div ref={tabsContentRef} />}
        {hasTabs && <Tabs items={getTabs(collectionAttrNames)} />}
      </>
    )
  }, [item.name, item.spec.attributes, isNew, customComponentContext, getTabs])

  const hasHeaderPlugins = pluginEngine.hasRenderers('view.header', `${item.name}.view.header`)
  const hasContentPlugins = pluginEngine.hasRenderers('view.content', `${item.name}.view.content`)
  const collapseAttrItems = [
    {
      key: 'mainAttributes',
      label: t('Main attributes'),
      children: renderAttributes(ownAttributes)
    }
  ]
  if (item.includeTemplates.length > 0) {
    collapseAttrItems.push({
      key: 'additionalAttributes',
      label: t('Additional attributes'),
      children: renderAttributes(templateAttributes)
    })
  }

  return (
    <Spin spinning={loading}>
      {pluginEngine.hasComponents('view.header') &&
        pluginEngine.renderComponents('view.header', customComponentContext)}
      {pluginEngine.hasComponents(`${item.name}.view.header`) &&
        pluginEngine.renderComponents(`${item.name}.view.header`, customComponentContext)}
      {hasHeaderPlugins && <div ref={headerRef} />}

      {!pluginEngine.hasComponents('view.header', `${item.name}.view.header`) && !hasHeaderPlugins && (
        <ViewNavTabHeader
          itemTab={itemTab}
          form={form}
          buffer={buffer}
          canCreate={acl.canCreate}
          canEdit={acl.canWrite}
          canDelete={acl.canDelete}
          viewState={viewState}
          setViewState={setViewState}
          isLockedByMe={isLockedByMe}
          setLockedByMe={setLockedByMe}
          setLoading={setLoading}
          onHtmlExport={handleHtmlExport}
          logoutIfNeed={logoutIfNeed}
        />
      )}

      {pluginEngine.hasComponents('view.content') &&
        pluginEngine.renderComponents('view.content', customComponentContext)}
      {pluginEngine.hasComponents(`${item.name}.view.content`) &&
        pluginEngine.renderComponents(`${item.name}.view.content`, customComponentContext)}
      {hasContentPlugins && <div ref={contentRef} />}

      {!pluginEngine.hasComponents('view.content', `${item.name}.view.content`) && !hasContentPlugins && (
        <Form
          form={form}
          size="small"
          layout="vertical"
          disabled={(!acl.canWrite || !isLockedByMe) /*|| viewState === ViewState.VIEW*/ && (!acl.canCreate || !isNew)}
          onFinish={handleFormFinish}
        >
          {pluginEngine.hasComponents('view.content.form.begin') &&
            pluginEngine.renderComponents('view.content.form.begin', customComponentContext)}
          {pluginEngine.hasComponents(`${item.name}.view.content.form.begin`) &&
            pluginEngine.renderComponents(`${item.name}.view.content.form.begin`, customComponentContext)}
          <Collapse defaultActiveKey={['mainAttributes']} items={collapseAttrItems} />
          {pluginEngine.hasComponents('view.content.form.end') &&
            pluginEngine.renderComponents('view.content.form.end', customComponentContext)}
          {pluginEngine.hasComponents('view.content.form.end') &&
            pluginEngine.renderComponents('view.content.form.end', customComponentContext)}
        </Form>
      )}

      {pluginEngine.hasComponents('view.footer') &&
        pluginEngine.renderComponents('view.footer', customComponentContext)}
      {pluginEngine.hasComponents(`${item.name}.view.footer`) &&
        pluginEngine.renderComponents(`${item.name}.view.footer`, customComponentContext)}
      {pluginEngine.hasRenderers('view.footer', `${item.name}.view.footer`) && <div ref={footerRef} />}

      {renderTabs()}
    </Spin>
  )
}

export default memo(ViewNavTab)
