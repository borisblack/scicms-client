import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Alert, Col, Row} from 'antd'
import {Dashboard, Dataset, IDash, UserInfo} from '../types'
import {ANTD_GRID_COLS} from '../config/constants'
import DashWrapper from './DashWrapper'
import DatasetService from '../services/dataset'
import biConfig from '../config/bi'

interface Props {
    me: UserInfo
    pageKey: string
    dashboard: Dashboard
}

const K = ANTD_GRID_COLS / biConfig.cols

const intCompareFn = (a: string, b: string) => parseInt(a) - parseInt(b)
const dashColCompareFn = (a: IDash, b: IDash) => a.x - b.x
const datasetService = DatasetService.getInstance()

export default function DashboardPanel({pageKey, dashboard}: Props) {
    const {dashes} = dashboard.spec
    const [datasets, setDatasets] = useState<{[name: string]: Dataset} | null>(null)
    const rows = useMemo(() => _.groupBy(dashes, d => d.y), [dashes])

    useEffect(() => {
        datasetService.findAll().then(datasetList => {
            setDatasets(_.mapKeys(datasetList, ds => ds.name))
        })
    }, [])

    const renderDash = useCallback((dash: IDash) => {
        if (datasets == null)
            throw new Error('Illegal state')

        const datasetName = dash.dataset
        if (!datasetName)
            return <Alert message="Dataset name not specified" type="error"/>

        const dataset = datasets[datasetName]
        if (!dataset)
            return <Alert message="Dataset not found" type="error"/>

        return (
            <DashWrapper
                pageKey={pageKey}
                dataset={dataset}
                dashboard={dashboard}
                dash={dash}
            />
        )
    }, [datasets, pageKey])

    const rowKeys = Object.keys(rows).sort(intCompareFn)
    return (
        <>
            {datasets && rowKeys.map((rowIndex) => {
                const colDashes = rows[rowIndex]
                return(
                    <Row key={rowIndex} gutter={16}>
                        {colDashes.sort(dashColCompareFn).map(colDash => (
                            <Col key={colDash.name} span={colDash.w * K}>
                                {renderDash(colDash)}
                            </Col>
                        ))}
                    </Row>
                )
            })}
        </>
    )
}