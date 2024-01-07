import {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, List, notification, Spin} from 'antd'
import {RightCircleOutlined} from '@ant-design/icons'
import {findLifecycleById} from 'src/services/lifecycle'
import {Lifecycle} from 'src/types/schema'
import {parseLifecycleSpec} from 'src/util/bpmn'

interface Props {
    lifecycleId: string
    currentState?: string | null
    onSelect: (state: string) => void
}

interface StateItem {
    title: string
}

const {Item: ListItem} = List

export default function Promote({lifecycleId, currentState: currentStateName, onSelect}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [lifecycle, setLifecycle] = useState<Lifecycle | null>(null)

    useEffect(() => {
        setLoading(true)
        findLifecycleById(lifecycleId)
            .then(it => {
                setLifecycle(it)
            })
            .catch((e: any) => {
                notification.error({
                    message: t('Request error'),
                    description: e.message
                })
            })
            .finally(() => {
                setLoading(false)
            })
    }, [lifecycleId])

    const getAllowedStates = useCallback((): StateItem[] => {
        if (!lifecycle)
            return []

        const {startEvent, states} = parseLifecycleSpec(lifecycle.spec)
        if (!currentStateName) {
            return startEvent.transitions
                .map(targetStateName => {
                    const allowedState = states[targetStateName]
                    if (!allowedState)
                        throw new Error('Invalid transition')

                    return {title: targetStateName}
                })
        }

        const currentState = states[currentStateName]
        if (!currentState)
            throw new Error('Invalid current state')

        return currentState.transitions
            .map(targetStateName => {
                const allowedState = states[targetStateName]
                if (!allowedState)
                    throw new Error('Invalid transition')

                return {title: targetStateName}
            })
    }, [currentStateName, lifecycle])

    return (
        <Spin spinning={loading}>
            {lifecycle && (
                <List
                    itemLayout="horizontal"
                    dataSource={getAllowedStates()}
                    renderItem={it => (
                        <ListItem>
                            <ListItem.Meta
                                title={<Button type="link" icon={<RightCircleOutlined/>} style={{paddingLeft: 0, paddingRight: 0}} onClick={() => onSelect(it.title)}>{it.title}</Button>}
                            />
                        </ListItem>
                    )}
                />
            )}
        </Spin>
    )
}