import {Permission, UserInfo} from '../types'
import {getBit} from '.'

function hasAccess(user: UserInfo, permission: Permission, bit: number): boolean {
    for (const access of permission.accesses.data) {
        const identity = access.target.data
        if (getBit(access.mask, bit) && ((identity.principal && identity.name === user.username) || (!identity.principal && hasRole(user, identity.name))))
            return true
    }
    return false
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
