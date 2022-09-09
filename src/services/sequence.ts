import {gql} from '@apollo/client'

import {apolloClient, extractGraphQLErrorMessages} from '.'
import i18n from '../i18n'
import {Sequence} from '../types'

const FIND_ALL_BY_NAME_QUERY = gql`
    query findAllSequencesByName($name: String!) {
        sequences(
            filters: {
                name: {
                    containsi: $name
                }
            }
        ) {
            data {
                id
                name
                displayName
            }
        }
    }
`

export default class SequenceService {
    private static instance: SequenceService | null = null

    static getInstance() {
        if (!SequenceService.instance)
            SequenceService.instance = new SequenceService()

        return SequenceService.instance
    }

    async findAllByName(name: string): Promise<Sequence[]> {
        const res = await apolloClient.query({query: FIND_ALL_BY_NAME_QUERY, variables: {name}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.sequences.data
    }
}