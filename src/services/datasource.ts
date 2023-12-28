import axios from 'axios'
import {extractAxiosErrorMessage} from '.'
import {Pagination, PaginationInput} from '../types'
import {Table} from '../types/bi'
import qs from 'qs'

export interface DatasourceTablesInput {
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

export async function loadDatasourceTables(datasource: string, input: DatasourceTablesInput): Promise<DatasourceTablesResponse> {
    const query = qs.stringify(input)

    try {
        const res = await axios.get(`/api/datasource/${datasource}/tables${query ? `?${query}` : ''}`)
        return res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }
}
