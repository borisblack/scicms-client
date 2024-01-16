import {useMemo} from 'react'
import {Form} from 'antd'
import {useDrop} from 'react-dnd'

import {Dataset, IDash, NamedColumn} from 'src/types/bi'
import FieldWidget from './FieldWidget'
import styles from './DashAxisArea.module.css'
import {DndItemType} from 'src/config/constants'
import DashFieldOverlay, {OverlayType} from './DashFieldOverlay'

interface DashAxisAreaProps {
    dataset: Dataset
    dash: IDash
    namePath: string | string[]
    cardinality: number
    canEdit: boolean
}

const FIELD_WIDGET_HEIGHT = 30

export default function DashAxisArea({dataset, dash, namePath, cardinality, canEdit}: DashAxisAreaProps) {
    const datasetFields = useMemo(() => (dataset.spec.columns ?? {}), [dataset.spec.columns])
    const allFields = useMemo(() => ({...datasetFields, ...dash.fields}), [datasetFields, dash.fields])
    const form = Form.useFormInstance()
    const value: string[] | undefined = Form.useWatch(namePath, form)

    const [{isOver, canDrop}, drop] = useDrop(
        () => ({
            accept: DndItemType.DATASET_FIELD,
            canDrop: (field: NamedColumn) => handleCanDrop(field),
            drop: (field: NamedColumn) => handleDrop(field),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop()
            })
        }),
        [value, cardinality, canEdit]
    )

    function handleCanDrop(field: NamedColumn): boolean {
        if (!canEdit)
            return false

        if (value && value.includes(field.name))
            return false

        return cardinality === -1 || (cardinality > 0 && (value ?? []).length < cardinality)
    }

    function handleDrop(field: NamedColumn) {
        handleAxisAdd(field.name)
    }

    function handleAxisAdd(valueToAdd: string) {
        form.setFieldValue(namePath, [...(value ?? []), valueToAdd])
        form.validateFields()
    }

    function handleAxisRemove(valueToRemove: string) {
        const newValue = (value ?? []).filter(v => v !== valueToRemove)
        form.setFieldValue(namePath, newValue.length === 0 ? undefined : newValue)
        form.validateFields()
    }

    return (
        <div
            ref={drop}
            className={styles.dashAxisArea}
            style={{minHeight: (value?.length ?? 1) * FIELD_WIDGET_HEIGHT}}
        >
            {value && value.map(v => {
                const field = {...allFields[v], name: v}
                return (
                    <FieldWidget
                        key={v}
                        field={field}
                        isDatasetField={datasetFields.hasOwnProperty(v)}
                        canEdit={canEdit}
                        onRemove={() => handleAxisRemove(v)}/>
                )
            })}
            {isOver && !canDrop && <DashFieldOverlay type={OverlayType.IllegalMoveHover} />}
            {isOver && canDrop && <DashFieldOverlay type={OverlayType.LegalMoveHover} />}
        </div>
    )
}