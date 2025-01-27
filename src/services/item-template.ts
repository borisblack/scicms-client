import _ from 'lodash'
import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {ItemTemplate} from '../types/schema'

export type ItemTemplateMap = Record<string, ItemTemplate>

const FIND_ALL_QUERY = gql`
  query {
    itemTemplates {
      data {
        id
        name
        core
        spec
        majorRev
        minorRev
        locale
        state
        createdAt
        updatedAt
        permission {
          data {
            id
          }
        }
      }
    }
  }
`

export const fetchItemTemplates = (): Promise<ItemTemplateMap> =>
  apolloClient.query({query: FIND_ALL_QUERY}).then(res => {
    if (res.errors) {
      console.error(extractGraphQLErrorMessages(res.errors))
      throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return _.mapKeys(res.data.itemTemplates.data, itemTemplate => itemTemplate.name)
  })
