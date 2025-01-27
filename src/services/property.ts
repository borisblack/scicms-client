import _ from 'lodash'
import {gql} from '@apollo/client'
import i18n from '../i18n'

import {Property, PropertyScope, PropertyType} from '../types/schema'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {FieldType} from 'src/types'

export type PropertyMap = Record<string, Property>

const FIND_ALL_QUERY = gql`
  query {
    properties {
      data {
        name
        type
        value
        scope
      }
    }
  }
`

export const fetchProperties = async (): Promise<PropertyMap> => {
  const res = await apolloClient.query({query: FIND_ALL_QUERY})
  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return _.mapKeys(
    res.data.properties.data
      .filter((p: Property) => p.value != null && (!p.scope || p.scope === PropertyScope.client))
      .map((p: Property) => ({...p, value: parsePropertyValue(p.type, p.value as string)})),
    property => property.name
  )
}

function parsePropertyValue(type: PropertyType, value: string): any {
  switch (type) {
    case FieldType.string:
    case FieldType.uuid:
    case FieldType.email:
    case FieldType.text:
      return value
    case FieldType.bool:
      return value === '1' || value === 'true'
    case FieldType.int:
    case FieldType.long:
    case FieldType.float:
    case FieldType.double:
    case FieldType.decimal:
      return Number(value)
    case FieldType.date:
    case FieldType.time:
    case FieldType.datetime:
    case FieldType.timestamp:
      return value
    case FieldType.json:
      return value === '' ? {} : JSON.parse(value)
    case FieldType.array:
      return value === '' ? [] : value.split('\n')
  }
}
