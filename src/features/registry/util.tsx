import _ from 'lodash'
import i18n from 'src/i18n'
import {ItemType} from 'antd/lib/menu/hooks/useItems'

import {MenuItem, SubMenu} from 'src/config/menu'
import IconSuspense from 'src/uiKit/icons/IconSuspense'
import {ItemMap} from 'src/services/item'
import {MDIContext} from 'src/uiKit/MDITabs'
import {Item, ItemDataWrapper} from 'src/types/schema'
import {createMDITab} from 'src/util/mdi'
import {UserInfo, ViewType} from 'src/types'

interface ToAntdMenuItemsParams {
    ctx: MDIContext<ItemDataWrapper>
    me: UserInfo | null
    items: ItemMap
    menuItems: (SubMenu | MenuItem)[]
}

export const toAntdMenuItems = ({me, ctx, items, menuItems}: ToAntdMenuItemsParams): ItemType[] =>
  menuItems
    .filter(it => !('roles' in it) || _.intersection(it.roles, me?.roles).length > 0)
    .filter(it => !('itemName' in it) || items[it.itemName])
    .map(it => {
      if ('children' in it) {
        return {
          key: it.key,
          label: i18n.t(it.label) as string,
          icon: <span><IconSuspense iconName={it.icon}/></span>,
          children: toAntdMenuItems({me, ctx, items, menuItems: it.children})
        }
      } else {
        const item = items[it.itemName]
        return {
          key: item.id,
          label: i18n.t(item.displayPluralName) as string,
          icon: <span><IconSuspense iconName={item.icon}/></span>,
          onClick: () => handleItemClick(ctx, item)
        }
      }
    })

function handleItemClick(ctx: MDIContext<ItemDataWrapper>, item: Item) {
  ctx.openTab(
    createMDITab(item, ViewType.default)
  )
}