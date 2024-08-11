import {DateTime} from 'luxon'
import {UserInfo} from '../types'
import {Permission} from '../types/schema'
import {getBit} from '.'
import {UTC} from 'src/config/constants'

function hasAccess(user: UserInfo | null, permission: Permission, bit: number): boolean {
  if (user == null)
    return false

  const accesses = permission.accesses.data
    .filter(acc => {
      if (!getBit(acc.mask, bit))
        return false

      const identity = acc.target.data
      if (identity.principal && identity.name !== user.username)
        return false

      if ((!identity.principal && !hasRole(user, identity.name)))
        return false

      const beginDate = DateTime.fromISO(acc.beginDate, {zone: UTC})
      const endDate = acc.endDate == null ? null : DateTime.fromISO(acc.endDate, {zone: UTC})
      const now = DateTime.now().setZone(UTC, {keepLocalTime: true})
      return beginDate <= now && (endDate == null || endDate > now)
    })
    .sort((a, b) => {
      let res = (a.sortOrder ?? Number.MAX_VALUE) - (b.sortOrder ?? Number.MAX_VALUE)
      if (res !== 0)
        return res

      if (a.granting === b.granting)
        return 0

      return a.granting ? 1 : -1
    })

  return accesses.length > 0 && accesses[0].granting
}

export function hasRole(user: UserInfo | null, role: string): boolean {
  if (user == null)
    return false

  const roleSet = new Set(user.roles)
  return roleSet.has(role)
}

export const canRead = (user: UserInfo | null, permission: Permission) => hasAccess(user, permission, 0)

export const canWrite = (user: UserInfo | null, permission: Permission) => hasAccess(user, permission, 1)

export const canCreate = (user: UserInfo | null, permission: Permission) => hasAccess(user, permission, 2)

export const canDelete = (user: UserInfo | null, permission: Permission) => hasAccess(user, permission, 3)

export const canAdmin = (user: UserInfo | null, permission: Permission) => hasAccess(user, permission, 4)
