import {DeletingStrategy, FlaggedResponse, Item, ItemData, ResponseCollection} from '../types'
import _ from 'lodash'
import ItemService from './item'
import {gql} from '@apollo/client'
import {apolloClient, extractGraphQLErrorMessages} from './index'
import i18n from '../i18n'

interface ItemInput {
    [name: string]: any
}

export default class MutationService {
    private static instance: MutationService | null = null

    static getInstance() {
        if (!MutationService.instance)
            MutationService.instance = new MutationService()

        return MutationService.instance
    }

    private itemService = ItemService.getInstance()

    async create(item: Item, data: ItemInput, locale?: string): Promise<ItemData> {
        if (!item.localized && locale)
            throw new Error('The locale attribute can be specified for localized item only.')

        const mutation = gql(this.buildCreateMutation(item))
        const variables: any = {data}
        if (locale) variables.locale = locale

        const res = await apolloClient.mutate({mutation, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`create${_.upperFirst(item.name)}`].data
    }

    private buildCreateMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation create${capitalizedItemName}($data: ${capitalizedItemName}Input!) {
                create${capitalizedItemName}(data: $data) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async createVersion(item: Item, id: string, data: ItemInput, majorRev?: string, locale?: string | null, copyCollectionRelations?: boolean): Promise<ItemData> {
        if (!item.versioned)
            throw new Error('Item is not versioned')

        if (item.manualVersioning && !majorRev)
            throw new Error('The majorRev attribute must be specified for manual versioning item.')

        if (!item.manualVersioning && majorRev)
            throw new Error('The majorRev attribute must be specified for manual versioning item only.')

        if (!item.localized && locale)
            throw new Error('The locale attribute can be specified for localized item only.')

        const mutation = gql(this.buildCreateVersionMutation(item))
        const variables: any = {id, data}
        if (majorRev) variables.majorRev = majorRev
        if (locale) variables.locale = locale
        if (copyCollectionRelations) variables.copyCollectionRelations = copyCollectionRelations

        const res = await apolloClient.mutate({mutation, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`create${_.upperFirst(item.name)}Version`].data
    }

    private buildCreateVersionMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation create${capitalizedItemName}Version($id: UUID!, $data: ${capitalizedItemName}Input!, $majorRev: String, $locale: String, $copyCollectionRelations: Boolean) {
                create${capitalizedItemName}Version(
                    id: $id
                    data: $data
                    majorRev: $majorRev
                    locale: $locale
                    copyCollectionRelations: $copyCollectionRelations
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async createLocalization(item: Item, id: string, data: ItemInput, locale: string, copyCollectionRelations?: boolean): Promise<ItemData> {
        if (!item.localized)
            throw new Error('Item is not localized')

        const mutation = gql(this.buildCreateLocalizationMutation(item))
        const variables: any = {id, data, locale}
        if (copyCollectionRelations) variables.copyCollectionRelations = copyCollectionRelations

        const res = await apolloClient.mutate({mutation, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`create${_.upperFirst(item.name)}Localization`].data
    }

    private buildCreateLocalizationMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation create${capitalizedItemName}Localization($id: UUID!, $data: ${capitalizedItemName}Input!, $locale: String!, $copyCollectionRelations: Boolean) {
                create${capitalizedItemName}Localization(
                    id: $id
                    data: $data
                    locale: $locale
                    copyCollectionRelations: $copyCollectionRelations
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async update(item: Item, id: string, data: ItemInput): Promise<ItemData> {
        const mutation = gql(this.buildUpdateMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id, data}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`update${_.upperFirst(item.name)}`].data
    }

    private buildUpdateMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation update${capitalizedItemName}($id: UUID!, $data: ${capitalizedItemName}Input!) {
                update${capitalizedItemName}(
                    id: $id
                    data: $data
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async delete(item: Item, id: string, deletingStrategy: DeletingStrategy): Promise<ItemData> {
        const mutation = gql(this.buildDeleteMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id, deletingStrategy}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`delete${_.upperFirst(item.name)}`].data
    }

    private buildDeleteMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation delete${capitalizedItemName}($id: UUID!, $deletingStrategy: DeletingStrategy!) {
                delete${capitalizedItemName}(
                    id: $id
                    deletingStrategy: $deletingStrategy
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

     async purge<T extends ItemData>(item: Item, id: string, deletingStrategy: DeletingStrategy): Promise<ResponseCollection<T>> {
        const mutation = gql(this.buildPurgeMutation(item))

        const res = await apolloClient.mutate({mutation, variables: {id, deletingStrategy}})
         if (res.errors) {
             console.error(extractGraphQLErrorMessages(res.errors))
             throw new Error(i18n.t('An error occurred while executing the request'))
         }
         return res.data[`purge${_.upperFirst(item.name)}`]
    }

    private buildPurgeMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation purge${capitalizedItemName} ($id: UUID!, $deletingStrategy: DeletingStrategy!) {
                purge${capitalizedItemName} (
                    id: $id
                    deletingStrategy: $deletingStrategy
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
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

    async lock(item: Item, id: string): Promise<FlaggedResponse> {
        const mutation = gql(this.buildLockMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`lock${_.upperFirst(item.name)}`]
    }

    private buildLockMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation lock${capitalizedItemName}($id: UUID!) {
                lock${capitalizedItemName}(id: $id) {
                    success
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async unlock(item: Item, id: string): Promise<FlaggedResponse> {
        const mutation = gql(this.buildUnlockMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`unlock${_.upperFirst(item.name)}`]
    }

    private buildUnlockMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation unlock${capitalizedItemName}($id: UUID!) {
                unlock${capitalizedItemName}(id: $id) {
                    success
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }

    async promote(item: Item, id: string, state: string): Promise<ItemData> {
        const mutation = gql(this.buildPromoteMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id, state}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`promote${_.upperFirst(item.name)}`].data
    }

    private buildPromoteMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation promote${capitalizedItemName}($id: UUID!, $state: String!) {
                promote${capitalizedItemName}(
                    id: $id
                    state: $state
                ) {
                    data {
                        ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                    }
                }
            }
        `
    }
}