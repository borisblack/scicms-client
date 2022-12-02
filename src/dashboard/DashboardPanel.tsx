import _ from 'lodash'
import {useMemo, useState} from 'react'
import {Alert, Col, Row} from 'antd'
import {useTranslation} from 'react-i18next'

import {IDash, IDashboardSpec, UserInfo} from '../types'
import appConfig from '../config'
import {hasRole} from '../util/acl'
import {ROLE_ADMIN, ROLE_ANALYST} from '../config/constants'
import DashWrapper from './DashWrapper'

interface Props {
    me: UserInfo
    pageKey: string
    spec: IDashboardSpec
}

const ANTD_GRID_COLS = 24
const K = ANTD_GRID_COLS / appConfig.dashboard.cols

const intCompareFn = (a: string, b: string) => parseInt(a) - parseInt(b)

const dashColCompareFn = (a: IDash, b: IDash) => a.x - b.x

export default function DashboardPanel({me, pageKey, spec}: Props) {
    const {dashes} = spec
    const {t} = useTranslation()
    const [isFullScreenComponentExist, setFullScreenComponentExist] = useState<boolean>(false)
    const canPreview = useMemo(() => hasRole(me, ROLE_ANALYST) || hasRole(me, ROLE_ADMIN), [me])
    const rows = useMemo(() => _.groupBy(dashes, d => d.y), [dashes])

    return (canPreview ? (
        <>
            {Object.keys(rows).sort(intCompareFn).map(rowIndex => {
                const colDashes = rows[rowIndex]
                return(
                    <Row key={rowIndex} gutter={16}>
                        {colDashes.sort(dashColCompareFn).map(colDash => (
                            <Col key={colDash.name} span={colDash.w * K}>
                                <DashWrapper
                                    pageKey={pageKey}
                                    dash={colDash}
                                    isFullScreenComponentExist={isFullScreenComponentExist}
                                    onFullScreenComponentStateChange={setFullScreenComponentExist}
                                />
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