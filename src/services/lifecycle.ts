import {gql} from '@apollo/client'
import i18n from '../i18n'

import {Lifecycle} from '../types'
import {apolloClient, extractGraphQLErrorMessages} from './index'

export const DEFAULT_LIFECYCLE_ID = 'ad051120-65cf-440a-8fc3-7a24ac8301d3'

const FIND_BY_ID_QUERY = gql`
    query findLifecycle($id: ID!) {
        lifecycle(id: $id) {
            data {
                id
                name
                displayName
                description
                startState
                spec
            }
        }
    }
`

export default class LifecycleService {
    private static instance: LifecycleService | null = null

    static getInstance() {
        if (!LifecycleService.instance)
            LifecycleService.instance = new LifecycleService()

        return LifecycleService.instance
    }

    private cache: {[id: string]: Lifecycle} = {}

    findById = async (id: string): Promise<Lifecycle> => {
        if (!(id in this.cache)) {
            const res = await apolloClient.query({query: FIND_BY_ID_QUERY, variables: {id}})
            if (res.errors) {
                console.error(extractGraphQLErrorMessages(res.errors))
                throw new Error(i18n.t('An error occurred while executing the request'))
            }

            this.cache[id] = res.data.lifecycle.data
        }

        return this.cache[id]
    }
}