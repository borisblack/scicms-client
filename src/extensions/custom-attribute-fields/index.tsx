import {FC, ReactElement, ReactNode} from 'react'
import customAttributeFieldConfig from 'src/config/custom-attribute-field'
import {AttributeFieldProps} from 'src/pages/app/attribute-fields'
import {Attribute} from 'src/types/schema'

export interface CustomAttributeField {
    id: string
    supports: (itemName: string, attrName: string, attribute: Attribute) => boolean
    render: ({context}: CustomAttributeFieldRenderProps) => ReactNode
}

export interface CustomAttributeFieldRenderProps {
    context: CustomAttributeFieldRenderContext
}

export interface CustomAttributeFieldRenderContext extends AttributeFieldProps {}

const attributeFields: CustomAttributeField[] = customAttributeFieldConfig.attributeFields

export const hasAttributeField = (itemName: string, attrName: string, attribute: Attribute): boolean =>
  getAttributeField(itemName, attrName, attribute) != null

export const getAttributeField = (itemName: string, attrName: string, attribute: Attribute): CustomAttributeField | undefined =>
  attributeFields.find(af => af.supports(itemName, attrName, attribute))

export function renderAttributeField(context: CustomAttributeFieldRenderContext, defaultRender: FC<CustomAttributeFieldRenderContext>): ReactElement | null {
  const attributeField = getAttributeField(context.data.item.name, context.attrName, context.attribute)

  return <>{attributeField ? attributeField.render({context}) : defaultRender(context)}</>
}