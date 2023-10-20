import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {DashboardCategory} from '../types'

const FIND_ALL_QUERY = gql`
    query {
        dashboardCategories(sort: ["name:asc"]) {
            data {
                id
                name
                icon
                dashboards {
                    data {
                        id
                        name
                        isPublic
                    }
                }
                parentCategories {
                    data {
                        id
                        name
                        icon
                    }
                }
                childCategories {
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

export default class DashboardCategoryService {
    private static instance: DashboardCategoryService | null = null

    static getInstance() {
        if (!DashboardCategoryService.instance)
            DashboardCategoryService.instance = new DashboardCategoryService()

        return DashboardCategoryService.instance
    }

    findAll = (): Promise<DashboardCategory[]> =>
        apolloClient.query({query: FIND_ALL_QUERY})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return res.data.dashboardCategories.data
            })
}
