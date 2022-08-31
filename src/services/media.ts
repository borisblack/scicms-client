import axios from 'axios'
import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {DeletingStrategy, Media, MediaInfo} from '../types'
import appConfig from '../config'

export interface UploadInput {
    file: File,
    label?: string,
    description?: string,
    permission?: string
}

export interface MediaInput {
    label?: String
    description?: String
    lifecycle?: String
    permission?: String
}

const UPLOAD_MUTATION = gql`
    mutation upload($input: UploadInput!) {
        upload(input: $input) {
            id
            filename
            label
            description
            fileSize
            mimetype
            checksum
            createdAt
        }
    }
`

const UPLOAD_MULTIPLE_MUTATION = gql`
    mutation uploadMultiple($input: [UploadInput!]!) {
        uploadMultiple(input: $input) {
            id
            filename
            label
            description
            fileSize
            mimetype
            checksum
            createdAt
        }
    }
`

const UPDATE_MEDIA_MUTATION = gql`
    mutation updateMedia($id: UUID!, $data: MediaInput!) {
        updateMedia(
            id: $id
            data: $data
        ) {
            data {
                id
                filename
                label
                description
                fileSize
                mimeType
                path
                checksum
            }
        }
    }
`

const DELETE_MEDIA_MUTATION = gql`
    mutation deleteMedia($id: UUID!, $deletingStrategy: DeletingStrategy!) {
        deleteMedia(
            id: $id
            deletingStrategy: $deletingStrategy
        ) {
            data {
                id
                filename
                label
                description
                fileSize
                mimeType
                path
                checksum
            }
        }
    }
`

const APOLLO_REQUIRE_PREFLIGHT_HEADER = 'apollo-require-preflight'

export default class MediaService {
    private static instance: MediaService | null = null

    static getInstance() {
        if (!MediaService.instance)
            MediaService.instance = new MediaService()

        return MediaService.instance
    }

    async upload(input: UploadInput): Promise<MediaInfo> {
        const res = await apolloClient.mutate({
            mutation: UPLOAD_MUTATION,
            context: {
                headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
            },
            variables: {input}
        })

        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.upload
    }

    async uploadMultiple(input: UploadInput[]): Promise<MediaInfo[]> {
        const res = await apolloClient.mutate({
            mutation: UPLOAD_MULTIPLE_MUTATION,
            context: {
                headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
            },
            variables: {input}
        })

        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.uploadMultiple
    }

    async update(id: string, data: MediaInput): Promise<Media> {
        const res = await apolloClient.mutate({mutation: UPDATE_MEDIA_MUTATION, variables: {id, data}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.updateMedia.data
    }

    async deleteById(id: string): Promise<Media> {
        const res = await apolloClient.mutate({
            mutation: DELETE_MEDIA_MUTATION,
            variables: {id, deletingStrategy: DeletingStrategy.NO_ACTION}
        })
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.deleteMedia.data
    }

    async download(id: string, filename: string): Promise<void> {
        const res = await axios.get(this.getDownloadUrlById(id), {responseType: 'blob'})
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    getDownloadUrlById = (id: string): string => `${appConfig.coreUrl}/api/media/${id}/download`
}