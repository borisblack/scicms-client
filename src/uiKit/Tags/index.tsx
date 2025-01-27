import {Input, InputRef, Tag, Tooltip} from 'antd'
import {PlusOutlined} from '@ant-design/icons'

import './Tags.css'
import {ChangeEvent, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

interface Props {
  tags: string[]
  editable?: boolean
  newTagText?: string
  onChange: (tags: string[]) => void
}

export default function Tags({tags, editable, newTagText, onChange}: Props) {
  const {t} = useTranslation()
  const [inputVisible, setInputVisible] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<InputRef>(null)
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState('')
  const editInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [inputValue])

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag)
    onChange(newTags)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      onChange([...tags, inputValue])
    }
    setInputVisible(false)
    setInputValue('')
  }

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    const newTags = [...tags]
    newTags[editInputIndex] = editInputValue
    onChange(newTags)
    setEditInputIndex(-1)
    setInputValue('')
  }

  return (
    <>
      {tags.map((tag, index) => {
        if (editable && editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size="small"
              className="tag-input"
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          )
        }

        const isLongTag = tag.length > 20

        const tagElem = (
          <Tag className="edit-tag" key={tag} closable onClose={() => handleClose(tag)}>
            <span
              onDoubleClick={e => {
                setEditInputIndex(index)
                setEditInputValue(tag)
                e.preventDefault()
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        )
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        )
      })}

      {inputVisible && (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          className="tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}

      {!inputVisible && (
        <Tag className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> {t(newTagText ?? 'New Tag')}
        </Tag>
      )}
    </>
  )
}
