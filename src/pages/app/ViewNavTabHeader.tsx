import React, {MouseEvent, ReactNode, useState} from 'react'
import {Alert, Button, Dropdown, FormInstance, Modal, notification, Popconfirm, Space} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import * as icons from '@ant-design/icons'
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DiffOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  Html5Outlined,
  LockOutlined,
  SaveOutlined,
  SubnodeOutlined,
  UnlockOutlined
} from '@ant-design/icons'

import {IBuffer, ViewState} from 'src/types'
import {FlaggedResponse, ItemData, ItemTab, ResponseCollection} from 'src/types/schema'
import {useTranslation} from 'react-i18next'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import {ItemFiltersInput} from 'src/services/query'
import Promote from './Promote'
import {
  ITEM_ITEM_NAME,
  ITEM_TEMPLATE_ITEM_NAME,
  LOCALE_ATTR_NAME,
  MAJOR_REV_ATTR_NAME,
  MINOR_REV_ATTR_NAME
} from 'src/config/constants'
import {useAppProperties, useAuth, useItemOperations, useMutationManager, useRegistry} from 'src/util/hooks'
import {useMDIContext} from '../../uiKit/MDITabs/hooks'
import {getTitle} from 'src/util/mdi'
import {pluginEngine} from 'src/extensions/plugins'
import {ApiMiddlewareContext, ApiOperation} from 'src/extensions/plugins/types'
import styles from './NavTab.module.css'
import {
  hasConfigIdAttribute,
  hasCurrentAttribute,
  hasGenerationAttribute,
  hasLifecycleAttribute,
  hasMajorRevAttribute,
  isItemLockable
} from 'src/util/schema'

interface Props {
  itemTab: ItemTab
  form: FormInstance
  buffer: IBuffer
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  viewState: ViewState
  setViewState: (viewState: ViewState) => void
  isLockedByMe: boolean
  setLockedByMe: (isLockedByMe: boolean) => void
  setLoading: (loading: boolean) => void
  onHtmlExport: () => void
  logoutIfNeed: () => void
}

const VERSIONS_MODAL_WIDTH = 800

const {confirm} = Modal

export default function ViewNavTabHeader({
  itemTab,
  form,
  buffer,
  canCreate,
  canEdit,
  canDelete,
  viewState,
  setViewState,
  isLockedByMe,
  setLockedByMe,
  setLoading,
  onHtmlExport,
  logoutIfNeed
}: Props) {
  const {item, data} = itemTab
  const canVersion =
    item.versioned &&
    hasConfigIdAttribute(item) &&
    hasMajorRevAttribute(item) &&
    hasGenerationAttribute(item) &&
    hasCurrentAttribute(item)
  const canPromote = hasLifecycleAttribute(item) && hasLifecycleAttribute(item)
  const isLockable = isItemLockable(item)
  const {me} = useAuth()
  const {items: itemMap} = useRegistry()
  const ctx = useMDIContext<ItemTab>()
  const {open: openItem} = useItemOperations()
  const isNew = !data?.id
  const isLocked = data?.lockedBy?.data?.id != null
  const Icon = item.icon ? (icons as any)[item.icon] : null
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const [isVersionsModalVisible, setVersionsModalVisible] = useState(false)
  const [isPromoteModalVisible, setPromoteModalVisible] = useState(false)
  const mutationManager = useMutationManager()

  function handleSave(evt: MouseEvent) {
    form.submit()
  }

  async function handleLock(evt: MouseEvent) {
    if (isNew) throw new Error('New item cannot be locked')

    if (!isLockable) return

    setLoading(true)
    try {
      const id = data?.[item.idAttribute] as string
      const doLock = async () => await mutationManager.lock(item, id)
      let locked: FlaggedResponse
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
        locked = await pluginEngine.handleApiMiddleware(item.name, ApiOperation.LOCK, apiMiddlewareContext, doLock)
      } else {
        locked = await doLock()
      }
      if (locked.success) ctx.updateActiveTab({...itemTab, data: locked.data})
      else
        notification.warning({
          message: 'Locking error',
          description: t('Item cannot be locked')
        })

      setLockedByMe(locked.success)
      setViewState(canVersion ? ViewState.CREATE_VERSION : ViewState.UPDATE)
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Locking error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(evt: MouseEvent) {
    if (isNew) throw new Error('New item cannot be unlocked')

    if (!isLockable) return

    setLoading(true)
    try {
      const id = data?.[item.idAttribute] as string
      const doUnlock = async () => await mutationManager.unlock(item, id)
      let unlocked
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
        unlocked = await pluginEngine.handleApiMiddleware(
          item.name,
          ApiOperation.UNLOCK,
          apiMiddlewareContext,
          doUnlock
        )
      } else {
        unlocked = await doUnlock()
      }
      if (unlocked.success) {
        ctx.updateActiveTab({...itemTab, data: unlocked.data})
      } else {
        notification.warning({
          message: 'Cancellation error',
          description: t('Item cannot be unlocked')
        })
      }
      setLockedByMe(!unlocked)
      setViewState(ViewState.VIEW)
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Cancellation error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!canDelete) throw new Error('Cannot delete this item')

    if (isNew) throw new Error('New item cannot be deleted')

    setLoading(true)
    try {
      const id = data?.[item.idAttribute] as string
      const doDelete = async () => await mutationManager.remove(item, id, appProps.mutation.deletingStrategy)
      let deleted: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
        deleted = await pluginEngine.handleApiMiddleware(item.name, ApiOperation.DELETE, apiMiddlewareContext, doDelete)
      } else {
        deleted = await doDelete()
      }
      ctx.updateActiveTab({...itemTab, data: deleted.data})

      if (isLockable) setLockedByMe(false)

      ctx.closeActiveTab(true)
      logoutIfNeed()
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Deletion error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handlePurge() {
    if (!canDelete) throw new Error('Cannot purge this item')

    if (isNew) throw new Error('New item cannot be purged')

    setLoading(true)
    try {
      const id = data?.[item.idAttribute] as string
      const doPurge = async () => await mutationManager.purge(item, id, appProps.mutation.deletingStrategy)
      let purged: ResponseCollection<ItemData>
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
        purged = await pluginEngine.handleApiMiddleware(item.name, ApiOperation.PURGE, apiMiddlewareContext, doPurge)
      } else {
        purged = await doPurge()
      }
      const deleted = purged.data.find(it => it.id === id) as ItemData
      ctx.updateActiveTab({...itemTab, data: deleted})

      if (isLockable) setLockedByMe(false)

      ctx.closeActiveTab(true)
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Purging error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handlePromote(state: string) {
    if (!canEdit || !canPromote) throw new Error('Cannot promote this item')

    if (isNew) throw new Error('New item cannot be promoted')

    setLoading(true)
    try {
      const id = data?.[item.idAttribute] as string
      const doPromote = async () => await mutationManager.promote(item, id, state)
      let promoted: ItemData
      if (pluginEngine.hasApiMiddleware(item.name)) {
        const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
        promoted = await pluginEngine.handleApiMiddleware(
          item.name,
          ApiOperation.PROMOTE,
          apiMiddlewareContext,
          doPromote
        )
      } else {
        promoted = await doPromote()
      }
      ctx.updateActiveTab({...itemTab, data: promoted})
      setPromoteModalVisible(false)
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Promotion error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  const showDeleteConfirm = () => {
    confirm({
      title: `${t('Delete Current Version')}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: handleDelete
    })
  }

  const showPurgeConfirm = () => {
    confirm({
      title: `${t('Delete All Versions')}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: handlePurge
    })
  }

  const getPurgeMenu = () => [
    {
      key: 'delete',
      label: t('Current Version'),
      onClick: showDeleteConfirm
    },
    {
      key: 'purge',
      label: t('All Versions'),
      onClick: showPurgeConfirm
    }
  ]

  const getExportMenu = () => [
    {
      key: 'html',
      label: (
        <Space>
          <Html5Outlined className="blue" />
          HTML
        </Space>
      ),
      onClick: onHtmlExport
    }
  ]

  const getVersionsExtraFiltersInput = (): ItemFiltersInput<ItemData> => {
    if (isNew) return {} as ItemFiltersInput<ItemData>

    return {
      id: {
        ne: data?.[item.idAttribute] as string
      },
      configId: {
        eq: data?.configId as string
      }
    }
  }

  function getExtra(): ReactNode[] {
    const extra: ReactNode[] = []

    if (isNew) {
      if (canCreate) {
        extra.push(
          <Button key="save" type="primary" onClick={handleSave}>
            <SaveOutlined /> {t('Save')}
          </Button>
        )
        extra.push(
          <Button key="cancel" icon={<CloseCircleOutlined />} onClick={() => ctx.closeActiveTab()}>
            {t('Cancel')}
          </Button>
        )
      }
    } else {
      if (canEdit) {
        if (isLockedByMe /*&& viewState !== ViewState.VIEW*/) {
          extra.push(
            <Button key="save" type="primary" onClick={handleSave}>
              <SaveOutlined /> {t('Save')}
            </Button>
          )

          if (isLockable)
            extra.push(
              <Button key="cancel" icon={<LockOutlined />} onClick={handleCancel}>
                {t('Cancel')}
              </Button>
            )
        } else if (!isLocked) {
          if (isLockable)
            extra.push(
              <Button key="lock" type="primary" icon={<UnlockOutlined />} onClick={handleLock}>
                {t('Edit')}
              </Button>
            )
        }
      }

      if (canVersion) {
        extra.push(
          <Button key="versions" icon={<DiffOutlined />} onClick={() => setVersionsModalVisible(true)}>
            {t('Versions')}
          </Button>
        )
      }

      if (
        canEdit &&
        canPromote &&
        isLockedByMe /*&& viewState !== ViewState.VIEW*/ &&
        data?.lifecycle.data &&
        item.name !== ITEM_ITEM_NAME &&
        item.name !== ITEM_TEMPLATE_ITEM_NAME
      ) {
        extra.push(
          <Button key="promote" type="primary" icon={<SubnodeOutlined />} onClick={() => setPromoteModalVisible(true)}>
            {t('Promote')}
          </Button>
        )
      }

      if (canDelete && (isLockedByMe || !isLocked)) {
        if (canVersion) {
          extra.push(
            <Dropdown key="purge" placement="bottomRight" menu={{items: getPurgeMenu()}}>
              <Button type="primary" danger icon={<DownOutlined />}>
                {t('Delete')}
              </Button>
            </Dropdown>
          )
        } else {
          extra.push(
            <Popconfirm key="delete" placement="bottomRight" title={`${t('Delete Item')}?`} onConfirm={handleDelete}>
              <Button type="primary" danger icon={<DeleteOutlined />}>
                {t('Delete')}
              </Button>
            </Popconfirm>
          )
        }
      }

      extra.push(
        <Dropdown key="export" placement="bottomLeft" trigger={['click']} menu={{items: getExportMenu()}}>
          <Button icon={<ExportOutlined />}>{t('Export')}</Button>
        </Dropdown>
      )
    }

    return extra
  }

  async function handleVersionSelect(selectedItemData: ItemData) {
    await openItem(item, selectedItemData[item.idAttribute])
    setVersionsModalVisible(false)
  }

  const title = getTitle(itemTab)
  return (
    <>
      {viewState === ViewState.CREATE_VERSION && (
        <Alert type="warning" closable message={t('A new version will be created')} />
      )}
      <PageHeader
        className={styles.pageHeader}
        title={
          Icon ? (
            <span>
              <Icon />
              &nbsp;&nbsp;{title}
            </span>
          ) : (
            title
          )
        }
        extra={getExtra()}
      />
      <Modal
        title={t('Versions')}
        open={isVersionsModalVisible}
        destroyOnClose
        width={VERSIONS_MODAL_WIDTH}
        footer={null}
        onCancel={() => setVersionsModalVisible(false)}
      >
        <SearchDataGridWrapper
          item={item}
          notHiddenColumns={[MAJOR_REV_ATTR_NAME, MINOR_REV_ATTR_NAME, LOCALE_ATTR_NAME]}
          extraFiltersInput={getVersionsExtraFiltersInput()}
          majorRev="all"
          locale={data?.locale}
          onSelect={handleVersionSelect}
        />
      </Modal>
      {data?.lifecycle?.data && (
        <Modal
          title={t('Promotion')}
          open={isPromoteModalVisible}
          destroyOnClose
          footer={null}
          onCancel={() => setPromoteModalVisible(false)}
        >
          <Promote lifecycleId={data.lifecycle.data.id} currentState={data.state} onSelect={handlePromote} />
        </Modal>
      )}
    </>
  )
}
