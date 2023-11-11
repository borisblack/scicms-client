import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Dashboard} from '../types'

const FIND_ALL_QUERY = gql`
    query {
        dashboards(sort: ["name:asc"]) {
            data {
                id
                name
                isPublic
                spec
                categories {
                    data {
                        id
                        name
                        icon
                    }
                }
            }
        }
    }
`

export const fetchDashboards = (): Promise<Dashboard[]> =>
    apolloClient.query({query: FIND_ALL_QUERY})
        .then(res => {
            if (res.errors) {
                console.error(extractGraphQLErrorMessages(res.errors))
                throw new Error(i18n.t('An error occurred while executing the request'))
            }
            return res.data.dashboards.data
        })
