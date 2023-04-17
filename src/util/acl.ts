import dayjs from 'dayjs'
import {Permission, UserInfo} from '../types'
import {getBit} from '.'

function hasAccess(user: UserInfo, permission: Permission, bit: number): boolean {
    const accesses = permission.accesses.data
        .filter(acc => {
            if (!getBit(acc.mask, bit))
                return false

            const identity = acc.target.data
            if (identity.principal && identity.name !== user.username)
                return false

            if ((!identity.principal && !hasRole(user, identity.name)))
                return false

            const beginDate = dayjs(acc.beginDate)
            const endDate = acc.endDate == null ? null : dayjs(acc.endDate)
            const now = dayjs()
            return beginDate.isBefore(now) && (endDate == null || endDate.isAfter(now))
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

export function hasRole(user: UserInfo, role: string) {
    const roleSet = new Set(user.roles)
    return roleSet.has(role)
}

export const canRead = (user: UserInfo, permission: Permission) => hasAccess(user, permission, 0)

export const canWrite = (user: UserInfo, permission: Permission) => hasAccess(user, permission, 1)

export const canCreate = (user: UserInfo, permission: Permission) => hasAccess(user, permission, 2)

export const canDelete = (user: UserInfo, permission: Permission) => hasAccess(user, permission, 3)

export const canAdmin = (user: UserInfo, permission: Permission) => hasAccess(user, permission, 4)
