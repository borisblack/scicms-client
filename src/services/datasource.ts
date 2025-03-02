import axios from 'axios'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {Pagination, PaginationInput} from '../types'
import {Table} from '../types/bi'
import qs from 'qs'
import {gql} from '@apollo/client'
import {Datasource} from 'src/types/schema'
import i18n from '../i18n'

export interface DatasourceTablesInput {
  schema?: string
  q?: string
  pagination?: PaginationInput
}

interface DatasourceTablesResponse {
  data: Table[]
  meta: DatasourceResponseMeta
}

interface DatasourceResponseMeta {
  pagination?: Pagination
}

const FIND_BY_ID_QUERY = gql`
  query findDatasource($id: ID!) {
    datasource(id: $id) {
      data {
        id
        name
        sourceType
      }
    }
  }
`

export const findDatasourceById = async (id: string): Promise<Datasource> => {
  const res = await apolloClient.query({query: FIND_BY_ID_QUERY, variables: {id}})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return res.data.datasource.data
}

export async function loadDatasourceTables(
  datasource: string,
  input: DatasourceTablesInput
): Promise<DatasourceTablesResponse> {
  const query = qs.stringify(input)

  try {
    const res = await axios.get(`/api/datasource/${datasource}/tables${query ? `?${query}` : ''}`)
    return res.data
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }
}
