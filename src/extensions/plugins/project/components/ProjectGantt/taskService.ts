import {gql} from '@apollo/client'
import {apolloClient, extractGraphQLErrorMessages} from 'src/services'
import i18n from 'src/i18n'
import {Task} from './types'
import _ from 'lodash'
import {ItemFiltersInput} from 'src/services/query'

const FIND_ALL_BY_FILTER_QUERY = gql`
    query findAllTasksByFilter(
        $filters: TaskFiltersInput
    ) {
        tasks(
            sort: ["sortOrder:asc"]
            filters: $filters
        ) {
        data {
            id
            name
            description
            project {
                data {
                    id
                }
            }
            start
            end
            progress
            isMilestone
            dependencies {
                data {
                    target {
                        data {
                            id
                        }
                    }
                }
            }
        }
    }
    }
`

export async function fetchAllTasksByFilter(projectId: string, level: number = -1, parentId?: string): Promise<Task[]> {
  const filters: ItemFiltersInput<Task> = buildFetchAllProjectTasksFilters(projectId, level, parentId)

  const res = await apolloClient.query({
    query: FIND_ALL_BY_FILTER_QUERY,
    variables: {
      filters
    }
  })

  if (res.errors) {
    console.error(extractGraphQLErrorMessages(res.errors))
    throw new Error(i18n.t('An error occurred while executing the request'))
  }

  return res.data.tasks.data
}

function buildFetchAllProjectTasksFilters(projectId: string, level: number, parentId?: string): ItemFiltersInput<Task> {
  const filters: ItemFiltersInput<Task> = {
    project: {
      id: {
        eq: projectId
      }
    }
  }

  if (level >= 0) {
    filters.level = {
      eq: level
    }
  }

  if (parentId != null) {
    filters.parent = {
      eq: projectId
    }
  }

  return filters
}