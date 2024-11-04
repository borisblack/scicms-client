import {Select} from 'antd'
import {NamedAttribute} from './types'
import TransferInput from 'src/uiKit/TransferInput'
import {useRegistry} from 'src/util/hooks'
import {useTranslation} from 'react-i18next'
import {useMemo, useState} from 'react'

interface TemplateAttributesSelectionProps {
  includeTemplates: string[]
  existingAttributes: NamedAttribute[]
  onChange: (selectedAttributes: NamedAttribute[]) => void
}

export default function TemplateAttributesSelection({includeTemplates, existingAttributes, onChange}: TemplateAttributesSelectionProps) {
  const {t} = useTranslation()
  const {itemTemplates} = useRegistry()
  const includeTemplateNames = useMemo(() => new Set(includeTemplates), [includeTemplates])
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | undefined>(() => {
    const availableTemplateNames = Object.keys(itemTemplates).filter(name => !includeTemplateNames.has(name))
    if (availableTemplateNames.length === 0)
      return undefined

    return availableTemplateNames[0]
  })

  const allExistingAttrNames = useMemo(() => {
    const templateAttrNames: string[] = includeTemplates
      .map(name => itemTemplates[name])
      .map(t => Object.keys(t.spec.attributes))
      .flatMap(attrNames => attrNames)

    console.log(includeTemplates)

    const ownAttrNames = existingAttributes.map(a => a.name)

    return new Set([...templateAttrNames, ...ownAttrNames])
  }, [existingAttributes, includeTemplates, itemTemplates])

  const availableAttributes: NamedAttribute[] = useMemo(() => {
    if (selectedTemplateName == null)
      return []

    const selectedTemplate = itemTemplates[selectedTemplateName]
    return Object.entries(selectedTemplate.spec.attributes)
      .filter(([name, attribute]) => !allExistingAttrNames.has(name))
      .map(([name, attribute]) => ({name, ...attribute}))
  }, [allExistingAttrNames, itemTemplates, selectedTemplateName])

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  function handleTemplateSelect(name: string) {
    setSelectedTemplateName(name)
    handleSelectedAttributesChange([])
  }

  function handleSelectedAttributesChange(names: string[]) {
    setSelectedAttributes(names)
    if (selectedTemplateName == null)
      return

    const selectedTemplate = itemTemplates[selectedTemplateName]
    onChange(names.map(name => ({name, ...selectedTemplate.spec.attributes[name]})))
  }

  return (
    <>
      <Select
        style={{width: 180, marginBottom: 10}}
        placeholder={t('Select template')}
        size="small"
        options={
          Object.entries(itemTemplates)
            .filter(([name, template]) => !includeTemplateNames.has(name))
            .filter(([name, template]) => Object.keys(template.spec.attributes).length > 0)
            .map(([name, template]) => ({value: name, label: name}))
        }
        value={selectedTemplateName}
        onSelect={handleTemplateSelect}
      />

      <TransferInput
        dataSource={availableAttributes.map(a => ({key: a.name, title: a.name, description: a.name}))}
        value={selectedAttributes}
        render={item => item.title}
        onChange={handleSelectedAttributesChange}
      />
    </>
  )
}