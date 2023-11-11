import {DeletingStrategy, FlaggedResponse, Item, ItemData, ResponseCollection} from '../types'
import _ from 'lodash'
import {gql} from '@apollo/client'
import {apolloClient, extractGraphQLErrorMessages} from './index'
import i18n from '../i18n'
import {ItemMap, listNonCollectionAttributes} from './item'

type ItemInput = Record<string, any>

export async function create(items: ItemMap, item: Item, data: ItemInput, majorRev?: string | null, locale?: string | null): Promise<ItemData> {
    if (item.manualVersioning && !majorRev)
        throw new Error('The majorRev attribute must be specified for manual versioning item')

    if (!item.manualVersioning && majorRev)
        throw new Error('The majorRev attribute must be specified for manual versioning item only')

    if (!item.localized && locale)
        throw new Error('The locale attribute can be specified for localized item only.')

    const mutation = gql(buildCreateMutation(items, item, locale))
    const variables: any = {data}
    if (majorRev) variables.majorRev = majorRev
    if (locale) variables.locale = locale

    const res = await apolloClient.mutate({mutation, variables})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`create${_.upperFirst(item.name)}`].data
}

const buildCreateMutation = (items: ItemMap, item: Item, locale?: string | null) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation create${capitalizedItemName}(
            $data: ${capitalizedItemName}Input!
            ${item.manualVersioning ? '$majorRev: String' : ''}
            ${locale ? '$locale: String' : ''}
        ) {
            create${capitalizedItemName}(
                data: $data
                ${item.manualVersioning ? 'majorRev: $majorRev' : ''}
                ${locale ? 'locale: $locale' : ''}
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function createVersion(
    items: ItemMap,
    item: Item,
    id: string,
    data: ItemInput,
    majorRev?: string | null,
    locale?: string | null,
    copyCollectionRelations?: boolean
): Promise<ItemData> {
    if (!item.versioned)
        throw new Error('Item is not versioned')

    if (item.manualVersioning && !majorRev)
        throw new Error('The majorRev attribute must be specified for manual versioning item')

    if (!item.manualVersioning && majorRev)
        throw new Error('The majorRev attribute must be specified for manual versioning item only')

    if (!item.localized && locale)
        throw new Error('The locale attribute can be specified for localized item only')

    const mutation = gql(buildCreateVersionMutation(items, item, locale, copyCollectionRelations))
    const variables: any = {id, data}
    if (majorRev) variables.majorRev = majorRev
    if (locale) variables.locale = locale
    if (copyCollectionRelations != null) variables.copyCollectionRelations = copyCollectionRelations

    const res = await apolloClient.mutate({mutation, variables})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`create${_.upperFirst(item.name)}Version`].data
}

const buildCreateVersionMutation = (items: ItemMap, item: Item, locale?: string | null, copyCollectionRelations?: boolean) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation create${capitalizedItemName}Version(
            $id: ID!
            $data: ${capitalizedItemName}Input!
            ${item.manualVersioning ? '$majorRev: String' : ''}
            ${locale ? '$locale: String' : ''}
            ${copyCollectionRelations == null ? '' : '$copyCollectionRelations: Boolean'}
        ) {
            create${capitalizedItemName}Version(
                id: $id
                data: $data
                ${item.manualVersioning ? 'majorRev: $majorRev' : ''}
                ${locale ? 'locale: $locale' : ''}
                ${copyCollectionRelations == null ? '' : 'copyCollectionRelations: $copyCollectionRelations'}
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function createLocalization(items: ItemMap, item: Item, id: string, data: ItemInput, locale: string, copyCollectionRelations?: boolean): Promise<ItemData> {
    if (!item.localized)
        throw new Error('Item is not localized')

    const mutation = gql(buildCreateLocalizationMutation(items, item, copyCollectionRelations))
    const variables: any = {id, data, locale}
    if (copyCollectionRelations) variables.copyCollectionRelations = copyCollectionRelations

    const res = await apolloClient.mutate({mutation, variables})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`create${_.upperFirst(item.name)}Localization`].data
}

const buildCreateLocalizationMutation = (items: ItemMap, item: Item, copyCollectionRelations?: boolean) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation create${capitalizedItemName}Localization(
            $id: ID!, $data: ${capitalizedItemName}Input!
            $locale: String!
            ${copyCollectionRelations == null ? '' : '$copyCollectionRelations: Boolean'}
        ) {
            create${capitalizedItemName}Localization(
                id: $id
                data: $data
                locale: $locale
                ${copyCollectionRelations == null ? '' : 'copyCollectionRelations: $copyCollectionRelations'}
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function update(items: ItemMap, item: Item, id: string, data: ItemInput): Promise<ItemData> {
    const mutation = gql(buildUpdateMutation(items, item))
    const res = await apolloClient.mutate({mutation, variables: {id, data}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`update${_.upperFirst(item.name)}`].data
}

const buildUpdateMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation update${capitalizedItemName}($id: ID!, $data: ${capitalizedItemName}Input!) {
            update${capitalizedItemName}(
                id: $id
                data: $data
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function remove(items: ItemMap, item: Item, id: string, deletingStrategy: DeletingStrategy): Promise<ItemData> {
    const mutation = gql(buildRemoveMutation(items, item))
    const res = await apolloClient.mutate({mutation, variables: {id, deletingStrategy}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`delete${_.upperFirst(item.name)}`].data
}

const buildRemoveMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation delete${capitalizedItemName}($id: ID!, $deletingStrategy: DeletingStrategy!) {
            delete${capitalizedItemName}(
                id: $id
                deletingStrategy: $deletingStrategy
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function purge<T extends ItemData>(items: ItemMap, item: Item, id: string, deletingStrategy: DeletingStrategy): Promise<ResponseCollection<T>> {
    const mutation = gql(buildPurgeMutation(items, item))

    const res = await apolloClient.mutate({mutation, variables: {id, deletingStrategy}})
     if (res.errors) {
         console.error(extractGraphQLErrorMessages(res.errors))
         throw new Error(i18n.t('An error occurred while executing the request'))
     }
     return res.data[`purge${_.upperFirst(item.name)}`]
}

const buildPurgeMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation purge${capitalizedItemName} ($id: ID!, $deletingStrategy: DeletingStrategy!) {
            purge${capitalizedItemName} (
                id: $id
                deletingStrategy: $deletingStrategy
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
                meta {
                    pagination {
                        page
                        pageCount
                        pageSize
                        total
                    }
                }
            }
        }
    `
}

export async function lock(items: ItemMap, item: Item, id: string): Promise<FlaggedResponse> {
    const mutation = gql(buildLockMutation(items, item))
    const res = await apolloClient.mutate({mutation, variables: {id}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`lock${_.upperFirst(item.name)}`]
}

const buildLockMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation lock${capitalizedItemName}($id: ID!) {
            lock${capitalizedItemName}(id: $id) {
                success
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function unlock(items: ItemMap, item: Item, id: string): Promise<FlaggedResponse> {
    const mutation = gql(buildUnlockMutation(items, item))
    const res = await apolloClient.mutate({mutation, variables: {id}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`unlock${_.upperFirst(item.name)}`]
}

const buildUnlockMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation unlock${capitalizedItemName}($id: ID!) {
            unlock${capitalizedItemName}(id: $id) {
                success
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}

export async function promote(items: ItemMap, item: Item, id: string, state: string): Promise<ItemData> {
    const mutation = gql(buildPromoteMutation(items, item))
    const res = await apolloClient.mutate({mutation, variables: {id, state}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
    return res.data[`promote${_.upperFirst(item.name)}`].data
}

const buildPromoteMutation = (items: ItemMap, item: Item) => {
    const capitalizedItemName = _.upperFirst(item.name)
    return `
        mutation promote${capitalizedItemName}($id: ID!, $state: String!) {
            promote${capitalizedItemName}(
                id: $id
                state: $state
            ) {
                data {
                    ${listNonCollectionAttributes(items, item).join('\n')}
                }
            }
        }
    `
}
