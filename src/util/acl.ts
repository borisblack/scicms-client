import {Permission, UserInfo} from '../types'

const mask = {
    READ: new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]),
    WRITE: new Set([2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31]),
    CREATE: new Set([4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31]),
    DELETE: new Set([8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31]),
    ADMINISTRATION: new Set([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
}

function hasAccess(user: UserInfo, permission: Permission, mask: Set<number>): boolean {
    const roleSet = new Set(user.roles)
    for (const access of permission.access.data) {
        const identity = access.target.data
        if (mask.has(access.mask)
            && ((identity.principal && identity.name === user.username) || (!identity.principal && roleSet.has(identity.name)))
        ) {
            return true
        }
    }
    return false
}

export const canRead = (user: UserInfo, permission: Permission) => hasAccess(user, permission, mask.READ)

export const canWrite = (user: UserInfo, permission: Permission) => hasAccess(user, permission, mask.WRITE)

export const canCreate = (user: UserInfo, permission: Permission) => hasAccess(user, permission, mask.CREATE)

export const canDelete = (user: UserInfo, permission: Permission) => hasAccess(user, permission, mask.DELETE)

export const canAdministration = (user: UserInfo, permission: Permission) => hasAccess(user, permission, mask.ADMINISTRATION)