import {gql} from '@apollo/client'

import {apolloClient} from '.'
import {Item} from '../types'

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
            }
        }
    }
`

export const findAllByNames = (names: string[]): Promise<Item[]> =>
    apolloClient.query({query: FIND_ALL_BY_NAMES_QUERY, variables: {names}})
        .then(result => result.data.items.data)