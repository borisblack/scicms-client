import {gql} from '@apollo/client'
import {apolloClient, extractGraphQLErrorMessages} from '../../../../services'
import i18n from '../../../../i18n'
import {Task} from './types'

const FIND_ALL_BY_PROJECT_ID_QUERY = gql`
    query findAllTasksByProjectId(
        $projectId: ID
    ) {
        tasks(
            sort: ["sortOrder:asc"]
            filters: {
                project: {
                    id: {
                        eq: $projectId
                    }
                }
            }
        ) {
        data {
            id
            name
            description
            start
            end
            progress
            project {
                data {
                    id
                }
            }
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

export async function fetchAllProjectTasks(projectId: string): Promise<Task[]> {
    const res = await apolloClient.query({
        query: FIND_ALL_BY_PROJECT_ID_QUERY,
        variables: {
            projectId
        }
    })

    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data.tasks.data
}