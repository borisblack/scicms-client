import {Transfer} from 'antd'
import {CSSProperties, ReactNode} from 'react'
import {RenderResult, TransferItem} from 'antd/es/transfer'

interface Props<RecordType extends TransferItem> {
    dataSource?: RecordType[]
    listStyle?: CSSProperties
    titles: ReactNode[]
    value?: string[]
    render?: (item: RecordType) => RenderResult
    onChange?: (targetKeys: string[]) => void
}

export default function TransferInput<RecordType extends TransferItem>({dataSource, listStyle, titles, render, value, onChange}: Props<RecordType>) {
    return (
        <Transfer
            dataSource={dataSource}
            listStyle={listStyle}
            titles={titles}
            targetKeys={value ?? []}
            onChange={onChange}
            render={render}
        />
    )
}