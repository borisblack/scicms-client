import {IPage, ViewType} from './pagesSlice'
import ItemContent from './ItemContent'
import ItemList from './ItemList'
import {UserInfo} from '../../types'

interface Props {
    me: UserInfo
    page: IPage
}

function Page({me, page}: Props) {
    const {item, viewType, data} = page

    return (
        <div className="page-content">
            {viewType === ViewType.default ? <ItemList me={me} item={item}/> : <ItemContent me={me} item={item} data={data}/>}
        </div>
    )
}

export default Page