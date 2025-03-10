import {
  ROLE_ADMIN,
  ROLE_ANALYST,
  ROLE_DESIGNER,
  ROLE_PROJECT_MANAGER,
  ROLE_STANDARD_CONTROL,
  ROLE_USER
} from './constants'

export interface MenuConfig {
  items: (SubMenu | MenuItem)[]
}

export interface SubMenu {
  key: string
  label: string
  icon?: string
  roles?: string[]
  children: (SubMenu | MenuItem)[]
}

export interface MenuItem {
  itemName: string // must much item name at scicms-core
}

const menuConfig: MenuConfig = {
  items: [
    {
      key: 'administration',
      label: 'Administration',
      icon: 'CrownOutlined',
      roles: [ROLE_ADMIN],
      children: [
        {
          itemName: 'property'
        },
        {
          key: 'security',
          label: 'Security',
          icon: 'LockOutlined',
          roles: [ROLE_ADMIN],
          children: [
            {
              itemName: 'group'
            },
            {
              itemName: 'user'
            },
            {
              itemName: 'permission'
            },
            {
              itemName: 'identity'
            }
          ]
        },
        {
          key: 'storage',
          label: 'Storage',
          icon: 'FaDatabase',
          roles: [ROLE_ADMIN],
          children: [
            {
              itemName: 'datasource'
            },
            {
              itemName: 'media'
            }
          ]
        },
        {
          itemName: 'itemTemplate'
        },
        {
          itemName: 'item'
        },
        {
          itemName: 'revisionPolicy'
        },
        {
          itemName: 'sequence'
        },
        {
          itemName: 'locale'
        },
        {
          itemName: 'lifecycle'
        }
      ]
    },
    {
      key: 'analysis',
      label: 'Analysis',
      icon: 'PieChartOutlined',
      roles: [ROLE_ADMIN, ROLE_ANALYST],
      children: [
        {
          itemName: 'dataset'
        },
        {
          itemName: 'dashboard'
        },
        {
          itemName: 'dashboardCategory'
        }
      ]
    },
    {
      key: 'design',
      label: 'Design',
      icon: 'RocketOutlined',
      roles: [ROLE_ADMIN, ROLE_DESIGNER, ROLE_STANDARD_CONTROL],
      children: [
        {
          itemName: 'product'
        },
        {
          itemName: 'partLabelGroup'
        },
        {
          itemName: 'part'
        },
        {
          itemName: 'labelClaim'
        },
        /*{
            itemName: 'startSheet'
        }, {
            itemName: 'changeNotice'
        }, {
            itemName: 'partType'
        },*/ {
          itemName: 'theme'
        } /*{
            itemName: 'department'
        }*/
      ]
    },
    {
      key: 'projectManagement',
      label: 'Project Management',
      icon: 'BuildOutlined',
      roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGER],
      children: [
        {
          itemName: 'project'
        },
        {
          itemName: 'resource'
        },
        {
          itemName: 'projectRole'
        }
      ]
    }
  ]
}

export default menuConfig
