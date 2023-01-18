import axios from 'axios'
import {gql} from '@apollo/client'
import i18n from '../i18n'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {AggregateType, Dataset} from '../types'

const FIND_ALL_QUERY = gql`
    query findAllDatasets {
        datasets {
            data {
                id
                name
                dataSource
                tableName
                query
                metricType
                metricField
                unit
                temporalType
                temporalField
                latitudeField
                longitudeField
                locationLabelField
            }
        }
    }
`

const FIND_BY_NAME_QUERY = gql`
    query findDatasetByName($name: String!) {
        datasets(
            filters: {
                name: {
                    eq: $name
                }
            }
        ) {
            data {
                id
                name
                dataSource
                tableName
                query
                metricType
                metricField
                unit
                temporalType
                temporalField
                latitudeField
                longitudeField
                locationLabelField
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

    async findByName(name: string): Promise<Dataset> {
        const res = await apolloClient.query({query: FIND_BY_NAME_QUERY, variables: {name}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        const {data} = res.data.datasets
        if (data.length === 0)
            throw new Error("Dataset not found")

        return data[0]
    }

    async loadData(
        datasetName: string,
        start: string | null,
        end: string | null,
        aggregateType?: AggregateType,
        groupBy?: string
    ): Promise<any[]> {
        const params: any = {}
        if (start != null)
            params.start = start

        if (end != null)
            params.end = end

        if (aggregateType != null) {
            params.aggregate = aggregateType

            if (aggregateType !== AggregateType.countAll) {
                if (groupBy == null)
                    throw new Error('The groupBy parameter must be specified')

                params.groupBy = groupBy
            }
        }

        try {
            const res = await axios.get(`/api/dataset/${datasetName}`, {params})
            return res.data
        } catch (e: any) {
            throw new Error(extractAxiosErrorMessage(e))
        }
    }
}
