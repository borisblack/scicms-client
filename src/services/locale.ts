import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Locale} from '../types'

const FIND_ALL_QUERY = gql`
    query {
        locales {
            data {
                id
                name
                displayName
                permission {
                    data {
                        id
                    }
                }
            }
        }
    }
`

export async function fetchLocales(): Promise<Locale[]> {
    const res = await apolloClient.query({query: FIND_ALL_QUERY})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data.locales.data
}
