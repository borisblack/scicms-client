import {gql} from '@apollo/client'

import {apolloClient} from '.'

export interface Item {
    id: string
    name: string
    displayName: string
    pluralName: string,
    description: string
}

export const findAllByNames = (names: string[]): Promise<Item[]> => {
    const query = gql`
        query {
            items(
                filters: {
                    name: {
                        in: [${names.map(name => `"${name}"`).join(', ')}]
                    }
                }
            ) {
                data {
                    id
                    name
                    displayName
                    pluralName
                    description
                }
            }
        }
    `

    return apolloClient.query({query}).then(result => result.data.items.data)
}