import axios from 'axios'
import qs from 'qs'
import {gql} from '@apollo/client'
import i18n from '../i18n'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {AggregateType, Dataset, DatasetFiltersInput, Pagination, PaginationInput} from '../types'

export interface DatasetInput<T> {
    filters?: DatasetFiltersInput<T>
    fields?: string[]
    pagination?: PaginationInput
    sort?: string[]
    aggregate?: AggregateType
    aggregateField?: string
    groupFields?: string[]
}

interface DatasetResponse<T> {
    data: T[]
    meta: DatasetResponseMeta
}

interface DatasetResponseMeta {
    pagination?: Pagination
}

// TODO: Add cacheTtl field after scicms-core updating
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
        const res = await axios.get(`/api/dataset/${datasetName}?${query}`)
        return res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }
}
