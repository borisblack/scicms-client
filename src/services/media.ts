import axios from 'axios'
import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractAxiosErrorMessage, extractGraphQLErrorMessages} from '.'
import {DeletingStrategy, MediaInfo} from '../types'
import {Media} from '../types/schema'

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
    mutation upload($file: Upload!) {
        upload(file: $file) {
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
    mutation uploadMultiple($files: [Upload!]!) {
        uploadMultiple(files: $files) {
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
    mutation updateMedia($id: ID!, $data: MediaInput!) {
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
    mutation deleteMedia($id: ID!, $deletingStrategy: DeletingStrategy!) {
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

export async function uploadData(input: UploadInput): Promise<MediaInfo> {
    const data = new FormData()
    data.set('file', input.file)
    if (input.label)
        data.set('label', input.label)

    if (input.description)
        data.set('description', input.description)

    if (input.permission)
        data.set('permission', input.permission)

    try {
        const res = await axios.post('/api/media/upload', data)
        return res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }
}

export async function uploadDataMultiple(input: UploadInput[]): Promise<MediaInfo> {
    const data = new FormData()
    input.forEach(it => {
        data.append('files', it.file)
        data.append('labels', it.label || '')
        data.append('descriptions', it.description || '')
        data.append('permission', it.permission || '')
    })

    try {
        const res = await axios.post('/api/media/upload-multiple', data)
        return res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }
}

export async function upload(file: File): Promise<MediaInfo> {
    const res = await apolloClient.mutate({
        mutation: UPLOAD_MUTATION,
        context: {
            headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
        },
        variables: {file}
    })

    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data.upload
}

export async function uploadMultiple(files: File[]): Promise<MediaInfo[]> {
    const res = await apolloClient.mutate({
        mutation: UPLOAD_MULTIPLE_MUTATION,
        context: {
            headers: {[APOLLO_REQUIRE_PREFLIGHT_HEADER]: true}
        },
        variables: {files}
    })

    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data.uploadMultiple
}

export async function update(id: string, data: MediaInput): Promise<Media> {
    const res = await apolloClient.mutate({mutation: UPDATE_MEDIA_MUTATION, variables: {id, data}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data.updateMedia.data
}

export async function deleteById(id: string): Promise<Media> {
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

export async function download(id: string, filename: string): Promise<void> {
    const res = await axios.get(getDownloadUrlById(id), {responseType: 'blob'})
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const getDownloadUrlById = (id: string): string => `/api/media/${id}/download`