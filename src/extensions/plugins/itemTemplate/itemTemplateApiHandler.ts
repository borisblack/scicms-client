import {
  CORE_ATTR_NAME,
  ITEM_TEMPLATE_ITEM_NAME,
  ITEM_TEMPLATE_MODEL_KIND,
  NAME_ATTR_NAME,
  SPEC_ATTR_NAME
} from "src/config/constants"
import {FlaggedResponse, ItemData, ItemTemplateModel} from "src/types/schema"
import axios from "axios"
import {extractAxiosErrorMessage} from "src/services"
import QueryManager from "src/services/query"
import {ApiMiddlewareContext, ApiOperation} from "../types"

export async function handleItemTemplateApiOperation<T extends ItemData>(
  operation: ApiOperation,
  context: ApiMiddlewareContext<T>,
  next: () => any
) {
  if (context.item.name !== ITEM_TEMPLATE_ITEM_NAME) throw new Error("Illegal argument")

  switch (operation) {
    case ApiOperation.CREATE:
    case ApiOperation.UPDATE:
      return await apply(context)
    case ApiOperation.DELETE:
      return await remove(context)
    case ApiOperation.LOCK:
      return await lock(context)
    case ApiOperation.UNLOCK:
      return await unlock(context)
    case ApiOperation.CREATE_VERSION:
    case ApiOperation.CREATE_LOCALIZATION:
    case ApiOperation.PURGE:
    case ApiOperation.PROMOTE:
    default:
      throw new Error("Unsupported operation")
  }
}

async function apply<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<ItemData> {
  const queryManager = new QueryManager(items)
  let id: string
  try {
    const res = await axios.post("/api/model/apply", toItemTemplateModel(getValue))
    id = res.data
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return data.data
}

const toItemTemplateModel = <T extends ItemData>(
  getValue: (path: keyof T, defaultValue?: any) => any
): ItemTemplateModel => ({
  coreVersion: "v1",
  kind: ITEM_TEMPLATE_MODEL_KIND,
  metadata: {
    name: getValue(NAME_ATTR_NAME),
    core: getValue(CORE_ATTR_NAME)
  },
  spec: getValue(SPEC_ATTR_NAME, {})
})

async function remove<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<ItemData> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  const data = await queryManager.findById(item, id)
  try {
    await axios.post(`/api/model/delete/itemTemplate/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  return data.data
}

async function lock<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<FlaggedResponse> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  try {
    await axios.post(`/api/model/lock/itemTemplate/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return {success: true, data: data.data}
}

async function unlock<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<FlaggedResponse> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  try {
    await axios.post(`/api/model/unlock/itemTemplate/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return {success: true, data: data.data}
}
