import {gql} from '@apollo/client'

import {apolloClient} from '.'
import {Item} from '../types'

const FIND_ALL_QUERY = gql`
    query {
        items {
            data {
                id
                name
                tableName
                displayName
                displayAttrName
                singularName
                pluralName
                description
                dataSource
                icon
                core
                performDdl
                versioned
                manualVersioning
                notLockable
                localized
                implementation
                spec
                checksum
                majorRev
                minorRev
                locale
                state
                createdAt
                updatedAt
                permission {
                    data {
                        access {
                            data {
                                mask
                                target {
                                    data {
                                        name
                                        principal
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`

const FIND_ALL_BY_NAMES_QUERY = gql`
    query findAllByNames($names: [String]) {
        items(
            filters: {
                name: {
                    in: $names
                }
            }
        ) {
            data {
                id
                name
                tableName
                displayName
                displayAttrName
                singularName
                pluralName
                description
                dataSource
                icon
                core
                performDdl
                versioned
                manualVersioning
                notLockable
                localized
                implementation
                checksum
                majorRev
                minorRev
                locale
                state
                createdAt
                updatedAt
            }
        }
    }
`

export default class ItemService {
    findAll = (): Promise<Item[]> =>
        apolloClient.query({query: FIND_ALL_QUERY}).then(res => res.data.items.data)

    findAllByNames = (names: string[]): Promise<{[name: string]: Item}> =>
        apolloClient.query({query: FIND_ALL_BY_NAMES_QUERY, variables: {names}})
            .then(result => result.data.items.data)
}
