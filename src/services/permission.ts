import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Item, ItemData, Permission, UserInfo} from '../types'
import * as ACL from '../util/acl'

interface PermissionCache {
    [id: string]: Permission
}

interface Acl {
    canRead: boolean
    canWrite: boolean
    canCreate: boolean
    canDelete: boolean
    canAdmin: boolean
}

export const DEFAULT_PERMISSION_ID = '6fd701bf-87e0-4aca-bbfd-fe1e9f85fc71'
export const SECURITY_PERMISSION_ID = '4e1f310d-570f-4a16-9f41-cbc80b08ab8e'
export const BI_PERMISSION_ID = '874e089e-cd9a-428a-962f-0c3d994cd371'

const FIND_ALL_QUERY = gql`
    query findAll {
        permissions {
            data {
                id
                name
                accesses {
                    data {
                        id
                        label
                        sortOrder
                        mask
                        granting
                        beginDate
                        endDate
                        target {
                            data {
                                id
                                name
                                principal
                            }
                        }
                    }
                }
            }
        }
    }
`

const FIND_ALL_BY_IDENTITY_NAMES_QUERY = gql`
    query findAllByIdentityNames($identityNames: [String]) {
        permissions {
            data {
                id
                name
                accesses(
                    filters: {
                        target: {
                            name: {
                                in: $identityNames
                            }
                        }
                    }
                ) {
                    data {
                        id
                        label
                        sortOrder
                        mask
                        granting
                        beginDate
                        endDate
                        target {
                            data {
                                id
                                name
                                principal
                            }
                        }
                    }
                }
            }
        }
    }
`

function arrayToCache(permissions: Permission[]) {
    const permissionCache: PermissionCache = {}
    permissions.forEach(it => {
        permissionCache[it.id] = it
    })

    return permissionCache
}

export default class PermissionService {
    private static instance: PermissionService | null = null

    static getInstance() {
        if (!PermissionService.instance)
            PermissionService.instance = new PermissionService()

        return PermissionService.instance
    }

    private permissions: PermissionCache = {}

    async initialize(me?: UserInfo) {
        if (me) {
            const data = await this.findAllByIdentityNames([...me.roles, me.username])
            this.permissions = arrayToCache(data)
        } else {
            const data = await this.findAll()
            this.permissions = arrayToCache(data)
        }
    }

    reset() {
        this.permissions = {}
    }

    findAll = (): Promise<Permission[]> =>
        apolloClient.query({query: FIND_ALL_QUERY})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return res.data.permissions.data
            })

    findAllByIdentityNames = (identityNames: string[]): Promise<Permission[]> =>
        apolloClient.query({query: FIND_ALL_BY_IDENTITY_NAMES_QUERY, variables: {identityNames}})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return res.data.permissions.data
            })

    findById = (id: string): Permission | null => this.permissions[id] ?? null

    getAcl(me: UserInfo, item: Item, data?: ItemData | null): Acl {
        const itemPermissionId = item.permission.data?.id
        const itemPermission = itemPermissionId ? this.findById(itemPermissionId) : null
        const canCreate = !!itemPermission && ACL.canCreate(me, itemPermission)

        const dataPermissionId = data?.permission?.data?.id
        const dataPermission = dataPermissionId ? this.findById(dataPermissionId) : null
        const canRead = !!dataPermission && ACL.canRead(me, dataPermission)
        const canWrite = !!dataPermission && ACL.canWrite(me, dataPermission)
        const canDelete = !!dataPermission && ACL.canDelete(me, dataPermission)
        const canAdmin = !!dataPermission && ACL.canAdmin(me, dataPermission)

        return {canCreate, canRead, canWrite, canDelete, canAdmin}
    }
}
