import {Lifecycle} from '../../types'
import {useCallback, useEffect, useState} from 'react'
import LifecycleService from '../../services/lifecycle'
import {Button, List, message, Spin} from 'antd'
import {RightCircleOutlined} from '@ant-design/icons'
import {parseLifecycleSpec} from '../../util/bpmn'

interface Props {
    lifecycleId: string
    currentState?: string | null
    onSelect: (state: string) => void
}

interface StateItem {
    title: string
}

const {Item: ListItem} = List

const lifecycleService = LifecycleService.getInstance()

export default function Promote({lifecycleId, currentState: currentStateName, onSelect}: Props) {
    const [loading, setLoading] = useState(false)
    const [lifecycle, setLifecycle] = useState<Lifecycle | null>(null)

    useEffect(() => {
        setLoading(true)
        lifecycleService.findById(lifecycleId)
            .then(it => {
                setLifecycle(it)
            })
            .catch((e: any) => {
                message.error(e.message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [lifecycleId])

    const getAllowedStates = useCallback((): StateItem[] => {
        if (!lifecycle)
            return []

        const {states} = parseLifecycleSpec(lifecycle.spec)
        if (!currentStateName) {
            const startState = states[lifecycle.startState]
            if (!startState)
                throw new Error('Invalid start state')

            return [{
                title: lifecycle.startState
            }]
        }

        const currentState = states[currentStateName]
        if (!currentState)
            throw new Error('Invalid current state')

        return currentState.transitions
            .map(targetStateName => {
                const allowedState = states[targetStateName]
                if (!allowedState)
                    throw new Error('Invalid transition')

                return {
                    title: targetStateName
                }
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