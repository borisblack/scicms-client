import {gql} from '@apollo/client'

import {apolloClient} from '.'
import {Permission, UserInfo} from '../types'

export interface PermissionCache {
    [id: string]: Permission
}

const FIND_ALL_QUERY = gql`
    query findAll {
        permissions {
            data {
                id
                name
                access {
                    data {
                        id
                        displayName
                        sortOrder
                        mask
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
                access(
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
                        displayName
                        sortOrder
                        mask
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

    permissions: PermissionCache = {}

    constructor(private me?: UserInfo) {}

    async initialize() {
        if (this.me) {
            const data = await this.findAllByIdentityNames([...this.me.roles, this.me.username])
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
        apolloClient.query({query: FIND_ALL_QUERY}).then(res => res.data.permissions.data)

    findAllByIdentityNames = (identityNames: string[]): Promise<Permission[]> =>
        apolloClient.query({query: FIND_ALL_BY_IDENTITY_NAMES_QUERY, variables: {identityNames}}).then(res => res.data.permissions.data)

    findById = (id: string): Permission | null => this.permissions[id] ?? null
}
