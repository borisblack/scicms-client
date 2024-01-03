import {DatasetSources, JoinedTable, JoinType, QueryOp, Table, UnaryQueryOp} from 'src/types/bi'

export interface SourcesQueryBuildResult {
    tableName: string | null
    query: string | null
}

const joinsMap: Record<JoinType, string> = {
    [JoinType.inner]: 'INNER JOIN',
    [JoinType.left]: 'LEFT JOIN',
    [JoinType.right]: 'RIGHT JOIN',
    [JoinType.full]: 'FULL JOIN',
}

const opMap: Record<string, string> = {
    [QueryOp.$eq]: '='
}

export default class SourcesQueryBuilder {
    build(sources: DatasetSources): SourcesQueryBuildResult {
        if (!this.validate(sources))
            return {tableName: null, query: null}

        const mainTable = sources.mainTable as Table
        const {joinedTables} = sources
        if (joinedTables.length === 0)
            return {tableName: mainTable.name, query: `SELECT * FROM ${mainTable.name}`}

        // SELECT
        let query: string = `SELECT ${Object.keys(mainTable.columns).map(key => `${mainTable.name}.${key}`).join(', ')}${joinedTables.length > 0 ? ',' : ''}\n`
        joinedTables.forEach((joinedTable, i) => {
            query += `\t${Object.keys(joinedTable.columns).map(key => `${joinedTable.name}.${key} AS ${joinedTable.name}__${key}`).join(', ')}${i < joinedTables.length - 1 ? ',' : ''}\n`
        })

        // FROM
        query += `FROM ${mainTable.name}\n`
        joinedTables.forEach((joinedTable, i) => {
            query += `\t${joinsMap[joinedTable.joinType ?? JoinType.inner]} ${joinedTable.name} ON ${joinedTable.joins.map(join => `${mainTable.name}.${join.mainTableField} ${opMap[join.op]} ${joinedTable.name}.${join.field}`).join(' AND ')}\n`
        })

        return {tableName: null, query}
    }

    validate(sources: DatasetSources) {
        if (sources.mainTable == null)
            return false

        for (const joinedTable of sources.joinedTables) {
            if (!this.validateJoinedTable(joinedTable)) {
                return false
            }
        }

        return true
    }

    validateJoinedTable(joinedTable: JoinedTable): boolean {
        if (joinedTable.joins.length === 0)
            return false

        for (const join of joinedTable.joins) {
            if (!join.field || !join.mainTableField)
                return false
        }

        return true
    }
}