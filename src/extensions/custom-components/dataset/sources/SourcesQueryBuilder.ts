import {DatasetSources, JoinedTable, JoinType, QueryOp, Table, UnaryQueryOp} from 'src/types/bi'

export interface SourcesQueryBuildResult {
    tableName: string | null
    query: string | null
}

const joinsMap: Record<JoinType, string> = {
  [JoinType.inner]: 'INNER JOIN',
  [JoinType.left]: 'LEFT JOIN',
  [JoinType.right]: 'RIGHT JOIN',
  [JoinType.full]: 'FULL JOIN'
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
    let query: string = `SELECT ${Object.keys(mainTable.columns).map(key => `${mainTable.name}.${key}`).join(',\n\t')}${joinedTables.length > 0 ? ',\n\t' : ''}`
    joinedTables.forEach((joinedTable, i) => {
      const joinedTableSelectColumns =
                Object.keys(joinedTable.columns).map(key => `${joinedTable.alias || joinedTable.name}.${key} AS ${joinedTable.alias || joinedTable.name}__${key}`)

      query += `${joinedTableSelectColumns.join(',\n\t')}${i < joinedTables.length - 1 ? ',\n\t' : '\n'}`
    })

    // FROM
    query += `FROM ${mainTable.name}\n`
    joinedTables.forEach((joinedTable, i) => {
      const joinExpressions =
                joinedTable.joins.map(join => `${mainTable.name}.${join.mainTableField} ${opMap[join.op]} ${joinedTable.alias || joinedTable.name}.${join.field}`)

      query += `\t${joinsMap[joinedTable.joinType ?? JoinType.inner]} ${joinedTable.name}${joinedTable.alias ? ` ${joinedTable.alias}` : ''} ON ${joinExpressions.join(' AND ')}\n`
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