import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Location} from '../types'

export interface LocationInput {
    latitude: number
    longitude: number
    label: string
    permission?: string
}

const CREATE_MUTATION = gql`
    mutation createLocation($data: LocationInput!) {
        createLocation(
            data: $data
        ) {
            data {
                id
                latitude
                longitude
                label
            }
        }
    }
`

const UPDATE_MUTATION = gql`
    mutation updateLocation($id: ID!, $data: LocationInput!) {
        updateLocation(
            id: $id
            data: $data
        ) {
            data {
                id
                latitude
                longitude
                label
            }
        }
    }
`

const DELETE_MUTATION = gql`
    mutation deleteLocation($id: ID!) {
        deleteLocation(id: $id) {
            data {
                id
                latitude
                longitude
                label
            }
        }
    }
`

export default class LocationService {
    private static instance: LocationService | null = null

    static getInstance() {
        if (!LocationService.instance)
            LocationService.instance = new LocationService()

        return LocationService.instance
    }

    async create(data: LocationInput): Promise<Location> {
        const res = await apolloClient.mutate({mutation: CREATE_MUTATION, variables: {data}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.createLocation.data
    }

    async update(id: string, data: LocationInput): Promise<Location> {
        const res = await apolloClient.mutate({mutation: UPDATE_MUTATION, variables: {id, data}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.updateLocation.data
    }

    async delete(id: string): Promise<Location> {
        const res = await apolloClient.mutate({mutation: DELETE_MUTATION, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.deleteLocation.data
    }
}
