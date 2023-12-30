import {useDrop} from 'react-dnd'

import {DndItemType} from 'src/config/constants'
import {DatasetSources, JoinedTable, JoinType, Table} from 'src/types/bi'
import styles from './Sources.module.css'
import TableWidget from './TableWidget'
import LineHorizontal from './LineHorizontal'
import {useEffect, useState} from 'react'
import LineVertical from './LineVertical'
import JoinedTableModal from './JoinedTableModal'

interface SourcesConstructorProps {
    sources: DatasetSources
    canEdit: boolean
    onChange: (newSources: DatasetSources) => void
}

const LEFT_PANE_WIDTH = 400
const RIGHT_PANE_WIDTH = 300
const TABLE_WIDGET_WIDTH = 300
const TABLE_WIDGET_HEIGHT = 32
const VERTICAL_SPACE = 12

export default function SourcesConstructor({sources, canEdit, onChange}: SourcesConstructorProps) {
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
        for (const joinedTable of sources.joinedTables) {
            if (!validateJoinedTable(joinedTable)) {
                setValid(false)
                return
            }
        }

        setValid(true)
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
        if (sources.mainTable == null) {
            onChange({
                mainTable: table,
                joinedTables: []
            })
        } else {
            onChange({
                mainTable: sources.mainTable,
                joinedTables: [
                    ...sources.joinedTables,
                    {...table, joinType: JoinType.inner, joins: []}
                ]
            })
        }
    }

    function validateJoinedTable(joinedTable: JoinedTable): boolean {
        if (joinedTable.joins.length === 0)
            return false

        for (const join of joinedTable.joins) {
            if (!join.field || !join.mainTableField)
                return false
        }

        return true
    }

    function clearSources() {
        onChange({
            mainTable: undefined,
            joinedTables: []
        })
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
        onChange({
            mainTable: sources.mainTable,
            joinedTables: sources.joinedTables.filter(t => t.name !== name)
        })
    }

    function renderLines() {
        let top = TABLE_WIDGET_HEIGHT / 2

        return sources.joinedTables.map((joinedTable, i) => {
            const vStep = (i === 0 ? (TABLE_WIDGET_HEIGHT / 2) : (i === 1 ? (TABLE_WIDGET_HEIGHT/2 + VERTICAL_SPACE) : (TABLE_WIDGET_HEIGHT + VERTICAL_SPACE)))
            const isJoinedTableValid = validateJoinedTable(joinedTable)
            const res = (i === 0) ? (
                <LineHorizontal
                    key={joinedTable.name}
                    className={isJoinedTableValid ? styles.valid : styles.invalid}
                    y={top}
                    x1={TABLE_WIDGET_WIDTH}
                    x2={LEFT_PANE_WIDTH}
                    onClick={() => handleLineClick(joinedTable)}
                />
            ) : (
                <div key={joinedTable.name}>
                    <LineVertical
                        className={isJoinedTableValid ? styles.valid : styles.invalid}
                        x={TABLE_WIDGET_WIDTH / 2}
                        y1={top}
                        y2={top + vStep}
                    />
                    <LineHorizontal
                        className={isJoinedTableValid ? styles.valid : styles.invalid}
                        y={top + vStep}
                        x1={TABLE_WIDGET_WIDTH / 2}
                        x2={LEFT_PANE_WIDTH}
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
        const newSources = sources.joinedTables.map(jt => jt.name === joinedTable.name ? joinedTable : jt)
        onChange({
            mainTable: sources.mainTable,
            joinedTables: newSources
        })
    }

    return (
        <>
            <div className={styles.sourcesConstructor} ref={drop}>
                <div className={styles.sourcesConstructor_content}>
                    <div
                        className={styles.sourcesConstructor_content_pane}
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
                        className={styles.sourcesConstructor_content_pane}
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