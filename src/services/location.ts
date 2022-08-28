import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Location} from '../types'

const CREATE_MUTATION = gql`
    mutation createLocation($latitude: Float!, $longitude: Float!, $label: String!) {
        createLocation(
            data: {
                latitude: $latitude
                longitude: $longitude
                label: $label
            }
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
    mutation updateLocation($id: ID!, $latitude: Float!, $longitude: Float!, $label: String!) {
        updateLocation(
            id: $id
            data: {
                latitude: $latitude
                longitude: $longitude
                label: $label
            }
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

export default class LocationService {
    private static instance: LocationService | null = null

    static getInstance() {
        if (!LocationService.instance)
            LocationService.instance = new LocationService()

        return LocationService.instance
    }

    async create(latitude: number, longitude: number, label: string): Promise<Location> {
        const res = await apolloClient.mutate({mutation: CREATE_MUTATION, variables: {latitude, longitude, label}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.createLocation.data
    }

    async update(id: string, latitude: number, longitude: number, label: string): Promise<Location> {
        const res = await apolloClient.mutate({mutation: UPDATE_MUTATION, variables: {id, latitude, longitude, label}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.updateLocation.data
    }
}
