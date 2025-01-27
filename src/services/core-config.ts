import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'

export interface CoreConfig {
  data: {
    dataSources: string[]
  }
  i18n: {
    defaultLocale: string
  }
}

const FETCH_CORE_CONFIG_QUERY = gql`
  query {
    config {
      data {
        dataSources
      }
      i18n {
        defaultLocale
      }
    }
  }
`

export async function fetchCoreConfig(): Promise<CoreConfig> {
  const res = await apolloClient.query({query: FETCH_CORE_CONFIG_QUERY})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return res.data.config
}
