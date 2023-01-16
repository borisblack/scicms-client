import {useEffect, useRef, useState} from 'react'
import type {TypedUseSelectorHook} from 'react-redux'
import {useDispatch, useSelector} from 'react-redux'
import type {AppDispatch, RootState} from '../store'

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function usePrevious(value: any): any {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}

export function useCache<T>(cb: () => Promise<T>) {
    const cache = useRef<T | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<T | null>(null)
    useEffect(() => {
        setLoading(true)
        if (cache.current) {
            setData(cache.current)
            setLoading(false)
        } else {
            cb().then(res => {
                cache.current = res
                setData(res)
                setLoading(false)
            })
        }
    }, [cb])

    return {loading, data}
}