import axios from 'axios'
import qs from 'qs'
import {gql} from '@apollo/client'
import i18n from '../i18n'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {Pagination, PaginationInput} from '../types'
import {AggregateType, Dataset, DatasetFiltersInput} from '../types/bi'

export interface DatasetInput<T> {
  fields?: DatasetFieldInput[]
  filters?: DatasetFiltersInput<T>
  sort?: string[]
  pagination?: PaginationInput
  aggregate?: AggregateType
  aggregateField?: string
  groupFields?: string[]
}

export interface DatasetFieldInput {
  name: string
  custom: boolean
  source?: string
  formula?: string
  aggregate?: AggregateType
}

interface DatasetResponse<T> {
  data: T[]
  query?: string
  params?: Record<string, any>
  timeMs?: number
  cacheHit?: boolean
  meta: DatasetResponseMeta
}

interface DatasetResponseMeta {
  pagination?: Pagination
}

const FIND_ALL_QUERY = gql`
  query findAllDatasets {
    datasets {
      data {
        id
        name
        datasource {
          data {
            id
            name
          }
        }
        tableName
        query
        cacheTtl
        description
        spec
        hash
      }
    }
  }
`

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await apolloClient.query({query: FIND_ALL_QUERY})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return res.data.datasets.data
}

export async function loadData<T>(datasetName: string, input: DatasetInput<T>): Promise<DatasetResponse<T>> {
  const query = qs.stringify(input)

  try {
    const res = await axios.get(`/api/dataset/${datasetName}${query ? `?${query}` : ''}`)
    return res.data
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }
}
