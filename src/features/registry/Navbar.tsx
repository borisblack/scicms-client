import _ from 'lodash'
import {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
import {LogoutOutlined, UserOutlined} from '@ant-design/icons'
// import {gql, useQuery} from '@apollo/client'
import {ItemType} from 'antd/lib/menu/hooks/useItems'

import {useAuth, useModal, useRegistry} from 'src/util/hooks'
import {AuthType} from 'src/types'
import {ItemDataWrapper} from 'src/types/schema'
import {MDIContext} from 'src/uiKit/MDITabs'
import logo from 'src/logo.svg'
import ChangePasswordModal from '../auth/ChangePasswordModal'
import styles from './Navbar.module.css'

type NavbarProps = {
  ctx: MDIContext<ItemDataWrapper>
  menuItems: ItemType[]
  isLoading?: boolean
  appPrefix?: string
  width?: number
}

const DEFAULT_NAVBAR_WIDTH = 275
const NAVBAR_COLLAPSED_KEY = 'navbarCollapsed'
const NAVBAR_COLLAPSED_KEY_SUFFIX = 'NavbarCollapsed'

const {Sider} = Layout

const isNavbarCollapsed = (key: string) => localStorage.getItem(key) === '1'

const setNavbarCollapsed = (key: string, collapsed: boolean) => localStorage.setItem(key, collapsed ? '1' : '0')

const Navbar = ({ctx, menuItems, isLoading = false, appPrefix, width = DEFAULT_NAVBAR_WIDTH}: NavbarProps) => {
  const {me, logout} = useAuth()
  const {loading, reset: resetRegistry} = useRegistry()
  const {t} = useTranslation()
  const navbarCollapsedKey = appPrefix ? `${appPrefix}${NAVBAR_COLLAPSED_KEY_SUFFIX}` : NAVBAR_COLLAPSED_KEY
  const [collapsed, setCollapsed] = useState(isNavbarCollapsed(navbarCollapsedKey))
  const {
    show: showChangePasswordModal,
    close: closeChangePasswordModal,
    modalProps: changePasswordModalProps
  } = useModal()
  // const { loading, error, data } = useQuery(ME_QUERY, {errorPolicy: 'all'})

  const handleLogout = useCallback(async () => {
    await logout()
    ctx.reset()
    resetRegistry()
  }, [ctx, logout, resetRegistry])

  const handleToggle = useCallback(() => {
    setNavbarCollapsed(navbarCollapsedKey, !collapsed)
    setCollapsed(!collapsed)
  }, [collapsed])

  function handleChangePassword() {
    showChangePasswordModal()
  }

  const getProfileChildMenuItems = (): ItemType[] => {
    if (me == null) return []

    const profileChildMenuItems: ItemType[] = []

    if (me.authType === AuthType.LOCAL) {
      profileChildMenuItems.push({
        key: 'changePassword',
        label: t('Change password'),
        onClick: handleChangePassword
      })
    }

    profileChildMenuItems.push({
      key: 'logout',
      label: t('Logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout
    })

    return profileChildMenuItems
  }

  return (
    <Sider
      className={styles.navbarSider}
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={width}
      onCollapse={handleToggle}
    >
      <div className={styles.navbarLogoWrapper} onClick={handleToggle}>
        <img src={logo} className={styles.navbarLogo} alt="logo" />
        {!collapsed && <span className={styles.navbarLogoText}>{t('SciCMS Admin')}</span>}
      </div>
      <Spin spinning={loading || isLoading}>
        <Menu
          mode="inline"
          theme="dark"
          items={[
            {
              key: 'profile',
              label: `${t('Profile')} (${me?.username ?? 'Anonymous'})`,
              icon: <UserOutlined />,
              children: getProfileChildMenuItems()
            },
            ...menuItems
          ]}
        />
      </Spin>

      <ChangePasswordModal {...changePasswordModalProps} onClose={closeChangePasswordModal} />
    </Sider>
  )
}

export default Navbar
