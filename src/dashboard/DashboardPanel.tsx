import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Alert, Col, Row} from 'antd'
import {useTranslation} from 'react-i18next'
import {registerLocale} from '@antv/g2plot'
import {Dataset, IDash, IDashboardSpec, UserInfo} from '../types'
import appConfig from '../config'
import {hasRole} from '../util/acl'
import {ANTD_GRID_COLS, ROLE_ADMIN, ROLE_ANALYST} from '../config/constants'
import DashWrapper from './DashWrapper'
import DatasetService from '../services/dataset'
import {RU_RU_LOCALE} from './locales/ru_RU'

interface Props {
    me: UserInfo
    pageKey: string
    spec: IDashboardSpec
}

// Register additional locales
registerLocale('ru-RU', RU_RU_LOCALE)

const K = ANTD_GRID_COLS / appConfig.dashboard.cols

const intCompareFn = (a: string, b: string) => parseInt(a) - parseInt(b)
const dashColCompareFn = (a: IDash, b: IDash) => a.x - b.x
const datasetService = DatasetService.getInstance()

export default function DashboardPanel({me, pageKey, spec}: Props) {
    const {dashes} = spec
    const {t} = useTranslation()
    const [datasets, setDatasets] = useState<{[name: string]: Dataset} | null>(null)
    const [isFullScreenComponentExist, setFullScreenComponentExist] = useState<boolean>(false)
    const canPreview = useMemo(() => hasRole(me, ROLE_ANALYST) || hasRole(me, ROLE_ADMIN), [me])
    const rows = useMemo(() => _.groupBy(dashes, d => d.y), [dashes])

    useEffect(() => {
        datasetService.findAll().then(datasetList => {
            setDatasets(_.mapKeys(datasetList, ds => ds.name))
        })
    }, [spec])

    const renderDash = useCallback((dash: IDash) => {
        if (datasets == null)
            throw new Error('Illegal state')

        const datasetName = dash.dataset
        if (!datasetName)
            return <span>Dataset name not specified</span>

        const dataset = datasets[datasetName]
        if (!dataset)
            return <span>Dataset not found</span>

        return (
            <DashWrapper
                pageKey={pageKey}
                dataset={dataset}
                dash={dash}
                isFullScreenComponentExist={isFullScreenComponentExist}
                onFullScreenComponentStateChange={setFullScreenComponentExist}
            />
        )
    }, [datasets, isFullScreenComponentExist, pageKey])

    const rowKeys = Object.keys(rows).sort(intCompareFn)
    return (canPreview ? (
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
        ) : (
            <Alert message={t('You do not have permission to access this content')} type="info"/>
        )
    )
}