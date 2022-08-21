import axios from 'axios'
import {gql} from '@apollo/client'

import {apolloClient, throwGraphQLErrors} from '.'
import {Media, MediaInfo} from '../types'
import appConfig from '../config'

const UPLOAD_MUTATION = gql`
    mutation ($file: Upload!) {
        upload(file: $file) {
            id
            filename
            description
            fileSize
            mimetype
            checksum
            createdAt
        }
    }
`

const UPLOAD_MULTIPLE_MUTATION = gql`
    mutation ($files: [Upload!]!) {
        uploadMultiple(files: $files) {
            id
            filename
            description
            fileSize
            mimetype
            checksum
            createdAt
        }
    }
`

const DELETE_MEDIA_MUTATION = gql`
    mutation ($id: ID!) {
        deleteMedia(
            id: $id
            deletingStrategy: NO_ACTION
        ) {
            data {
                id
                configId
                filename
                displayName
                description
                fileSize
                mimeType
                path
                checksum
                majorRev
                minorRev
                locale
                state
                createdAt
                updatedAt
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

    async upload(file: File): Promise<MediaInfo> {
        const res = await apolloClient.mutate({
            mutation: UPLOAD_MUTATION,
            context: {
                headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
            },
            variables: {file}
        })

        if (res.errors)
            throwGraphQLErrors(res.errors)

        return res.data.upload
    }

    async uploadMultiple(files: File[]): Promise<MediaInfo[]> {
        const res = await apolloClient.mutate({
            mutation: UPLOAD_MULTIPLE_MUTATION,
            context: {
                headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
            },
            variables: {files}
        })

        if (res.errors)
            throwGraphQLErrors(res.errors)

        return res.data.uploadMultiple
    }

    async deleteById(id: string): Promise<Media> {
        const res = await apolloClient.mutate({mutation: DELETE_MEDIA_MUTATION, variables: {id}})
        if (res.errors)
            throwGraphQLErrors(res.errors)

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

    getDownloadUrlById = (id: string): string => `${appConfig.backendUrl}/api/media/${id}/download`
}