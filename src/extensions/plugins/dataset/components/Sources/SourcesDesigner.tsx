import {useDrop} from 'react-dnd'

import {DndItemType} from 'src/config/constants'
import {DatasetSources, JoinedTable, JoinType, Table} from 'src/types/bi'
import TableWidget from './TableWidget'
import LineHorizontal from './LineHorizontal'
import {useEffect, useState} from 'react'
import LineVertical from './LineVertical'
import JoinedTableModal from './JoinedTableModal'
import SourcesQueryBuilder, {SourcesQueryBuildResult} from './SourcesQueryBuilder'
import styles from './SourcesDesigner.module.css'

interface SourcesDesignerProps {
    sources: DatasetSources
    canEdit: boolean
    onChange: (sources: DatasetSources, buildResult: SourcesQueryBuildResult) => void
}

const LEFT_PANE_WIDTH = 400
const RIGHT_PANE_WIDTH = 300
const TABLE_WIDGET_WIDTH = 300
const TABLE_WIDGET_HEIGHT = 32
const VERTICAL_SPACE = 12

const queryBuilder = new SourcesQueryBuilder()

export default function SourcesDesigner({sources, canEdit, onChange}: SourcesDesignerProps) {
  const [isValid, setValid] = useState<boolean>(true)
  const [currentJoinedTable, setCurrentJoinedTable] = useState<JoinedTable>()
  const [openModal, setOpenModal] = useState(false)
  const [{isOver, canDrop}, drop] = useDrop(
    () => ({
      accept: DndItemType.SOURCE_TABLE,
      canDrop: (item: Table) => handleCanDrop(item),
      drop: (item: Table) => handleDrop(item),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }),
    [sources, canEdit]
  )

  useEffect(() => {
    setValid(queryBuilder.validate(sources))
  }, [sources])

  function handleCanDrop(table: Table): boolean {
    if (!canEdit)
      return false

    if (table.name === sources.mainTable?.name)
      return false

    const joinedTableIndex = sources.joinedTables.findIndex(t => t.name === table.name)
    return joinedTableIndex === -1
  }

  function handleDrop(table: Table) {
    let newSources: DatasetSources
    if (sources.mainTable == null) {
      newSources = {
        mainTable: table,
        joinedTables: []
      }
    } else {
      newSources = {
        mainTable: sources.mainTable,
        joinedTables: [
          ...sources.joinedTables,
          {...table, joinType: JoinType.inner, joins: []}
        ]
      }
    }
    onChange(newSources, queryBuilder.build(newSources))
  }

  function clearSources() {
    const newSources = {
      mainTable: null,
      joinedTables: []
    }
    onChange(newSources, queryBuilder.build(newSources))
  }

  function renderJoinedTables() {
    const vStep = TABLE_WIDGET_HEIGHT + VERTICAL_SPACE
    let top = 0

    return sources.joinedTables.map(table => {
      const res = (
        <TableWidget
          key={table.name}
          style={{width: TABLE_WIDGET_WIDTH, height: TABLE_WIDGET_HEIGHT, top}}
          table={table}
          canEdit={canEdit}
          onRemove={() => removeJoinedTable(table.name)}
        />
      )
      top += vStep

      return res
    })
  }

  function removeJoinedTable(name: string) {
    const newSources = {
      mainTable: sources.mainTable,
      joinedTables: sources.joinedTables.filter(t => t.name !== name)
    }
    onChange(newSources, queryBuilder.build(newSources))
  }

  function renderLines() {
    let top = TABLE_WIDGET_HEIGHT / 2

    return sources.joinedTables.map((joinedTable, i) => {
      const vStep = (i === 0 ? (TABLE_WIDGET_HEIGHT / 2) : (i === 1 ? (TABLE_WIDGET_HEIGHT/2 + VERTICAL_SPACE) : (TABLE_WIDGET_HEIGHT + VERTICAL_SPACE)))
      const isJoinedTableValid = queryBuilder.validateJoinedTable(joinedTable)
      const res = (i === 0) ? (
        <LineHorizontal
          key={joinedTable.name}
          y={top}
          x1={TABLE_WIDGET_WIDTH}
          x2={LEFT_PANE_WIDTH}
          valid={isJoinedTableValid}
          onClick={() => handleLineClick(joinedTable)}
        />
      ) : (
        <div key={joinedTable.name}>
          <LineVertical
            x={TABLE_WIDGET_WIDTH / 2}
            y1={top}
            y2={top + vStep}
            valid={isJoinedTableValid}
          />
          <LineHorizontal
            y={top + vStep}
            x1={TABLE_WIDGET_WIDTH / 2}
            x2={LEFT_PANE_WIDTH}
            valid={isJoinedTableValid}
            onClick={() => handleLineClick(joinedTable)}
          />
        </div>
      )

      top += vStep

      return res
    })
  }

  function handleLineClick(joinedTable: JoinedTable) {
    setCurrentJoinedTable(joinedTable)
    setOpenModal(true)
  }

  function handleJoinedTableChange(joinedTable: JoinedTable) {
    const newJoinedTables = sources.joinedTables.map(jt => jt.name === joinedTable.name ? joinedTable : jt)
    const newSources = {
      mainTable: sources.mainTable,
      joinedTables: newJoinedTables
    }
    onChange(newSources, queryBuilder.build(newSources))
  }

  return (
    <>
      <div className={styles.sourcesDesigner} ref={drop}>
        <div className={styles.sourcesDesigner_content}>
          <div
            className={styles.sourcesDesigner_content_pane}
            style={{width: LEFT_PANE_WIDTH}}
          >
            {sources.mainTable && (
              <TableWidget
                style={{width: TABLE_WIDGET_WIDTH, height: TABLE_WIDGET_HEIGHT}}
                table={sources.mainTable}
                canEdit={canEdit}
                onRemove={clearSources}
              />
            )}
          </div>
          <div
            className={styles.sourcesDesigner_content_pane}
            style={{width: RIGHT_PANE_WIDTH, left: LEFT_PANE_WIDTH}}
          >
            {renderJoinedTables()}
          </div>
          {renderLines()}
        </div>
      </div>

      {sources.mainTable && currentJoinedTable && (
        <JoinedTableModal
          mainTable={sources.mainTable}
          joinedTable={currentJoinedTable}
          open={openModal}
          canEdit={canEdit}
          onChange={handleJoinedTableChange}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  )
}