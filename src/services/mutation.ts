import {DeletingStrategy, Item, ItemData, Response, ResponseCollection} from '../types'
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

    async create(item: Item, data: ItemInput, locale?: string): Promise<Response> {
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

    async createVersion(item: Item, id: string, data: ItemInput, majorRev?: string, locale?: string, copyCollectionRelations?: boolean): Promise<Response> {
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
            mutation create${capitalizedItemName}Localization($id: ID!, $data: ${capitalizedItemName}Input!, $majorRev: String, $locale: String, $copyCollectionRelations: Boolean) {
                create${capitalizedItemName}(
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

    async createLocalization(item: Item, id: string, data: ItemInput, locale: string, copyCollectionRelations?: boolean): Promise<Response> {
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
            mutation create${capitalizedItemName}Localization($id: ID!, $data: ${capitalizedItemName}Input!, $locale: String!, $copyCollectionRelations: Boolean) {
                create${capitalizedItemName}(
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

    async update(item: Item, id: string, data: ItemInput): Promise<Response> {
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
            mutation update${capitalizedItemName}($id: ID!, $data: ${capitalizedItemName}Input!) {
                create${capitalizedItemName}(
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

    async delete(item: Item, id: string, deletingStrategy: DeletingStrategy): Promise<Response> {
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
            mutation delete${capitalizedItemName}($id: ID!, $deletingStrategy: DeletingStrategy!) {
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
            mutation purge${capitalizedItemName} ($id: ID!, $deletingStrategy: DeletingStrategy!) {
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

    async lock(item: Item, id: string): Promise<Boolean> {
        const mutation = gql(this.buildLockMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`lock${_.upperFirst(item.name)}`].success
    }

    private buildLockMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation lock${capitalizedItemName}($id: ID!) {
                lock${capitalizedItemName}(id: $id) {
                    success
                }
            }
        `
    }

    async unlock(item: Item, id: string): Promise<Boolean> {
        const mutation = gql(this.buildUnlockMutation(item))
        const res = await apolloClient.mutate({mutation, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        return res.data[`unlock${_.upperFirst(item.name)}`].success
    }

    private buildUnlockMutation = (item: Item) => {
        const capitalizedItemName = _.upperFirst(item.name)
        return `
            mutation unlock${capitalizedItemName}($id: ID!) {
                unlock${capitalizedItemName}(id: $id) {
                    success
                }
            }
        `
    }

    async promote(item: Item, id: string, state: string): Promise<Response> {
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
            mutation promote${capitalizedItemName}($id: ID!, $state: String!) {
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