import _ from 'lodash'
import {gql} from '@apollo/client'
import i18n from '../i18n'

import {Lifecycle} from '../types/schema'
import {apolloClient, extractGraphQLErrorMessages} from './index'

export type LifecycleMap = Record<string, Lifecycle>

export const DEFAULT_LIFECYCLE_ID = 'ad051120-65cf-440a-8fc3-7a24ac8301d3'

const FIND_ALL_QUERY = gql`
    query {
        lifecycles {
            data {
                id
                name
                displayName
                description
                spec
            }
        }
    }
`

const FIND_BY_ID_QUERY = gql`
    query findLifecycle($id: ID!) {
        lifecycle(id: $id) {
            data {
                id
                name
                displayName
                description
                spec
            }
        }
    }
`

export const fetchLifecycles = async (): Promise<LifecycleMap> => {
  const res = await apolloClient.query({query: FIND_ALL_QUERY})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return  _.mapKeys(res.data.lifecycles.data, lifecycle => lifecycle.id)
}

export const findLifecycleById = async (id: string): Promise<Lifecycle> => {
  const res = await apolloClient.query({query: FIND_BY_ID_QUERY, variables: {id}})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return  res.data.lifecycle.data
}
