import axios from 'axios'
import qs from 'qs'
import {gql} from '@apollo/client'
import i18n from '../i18n'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {AggregateType, Dataset, Pagination, PaginationInput} from '../types'

export interface DatasetInput<T> {
    filters?: DatasetFiltersInput<T>
    fields?: string[]
    pagination?: PaginationInput
    sort?: string[]
    aggregate?: AggregateType
    aggregateField?: string
    groupField?: string
}

export type DatasetFiltersInput<T> = {
    $and?: [T]
    $or?: [T]
    $not?: T
} & {[name: string]: PrimitiveFilterInput<string | boolean | number>}

interface PrimitiveFilterInput<T extends string | boolean | number> {
    $eq?: T
    $ne?: T
    $gt?: T
    $gte?: T
    $lt?: T
    $lte?: T
    $between?: T[]
    $startsWith?: T
    $endsWith?: T
    $contains?: T
    $containsi?: T
    $notContains?: T
    $notContainsi?: T
    $in?: T[]
    $notIn?: T[]
    $null?: boolean
    $notNull?: boolean
    $and?: [T]
    $or?: [T]
    $not?: T
}

interface DatasetResponse<T> {
    data: T[]
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
                dataSource
                tableName
                query
            }
        }
    }
`

export default class DatasetService {
    private static instance: DatasetService | null = null

    static getInstance() {
        if (!DatasetService.instance)
            DatasetService.instance = new DatasetService()

        return DatasetService.instance
    }

    async findAll(): Promise<Dataset[]> {
        const res = await apolloClient.query({query: FIND_ALL_QUERY})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.datasets.data
    }

    async loadData<T>(datasetName: string, input: DatasetInput<T>): Promise<DatasetResponse<T>> {
        const query = qs.stringify(input)

        try {
            const res = await axios.get(`/api/dataset/${datasetName}?${query}`)
            return res.data
        } catch (e: any) {
            throw new Error(extractAxiosErrorMessage(e))
        }
    }
}
