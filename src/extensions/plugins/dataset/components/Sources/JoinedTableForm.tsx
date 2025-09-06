import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Col, Form, Input, Row, Select, Typography} from 'antd'
import {DeleteOutlined, PlusCircleOutlined, TableOutlined} from '@ant-design/icons'
import {FormInstance, RuleObject, RuleRender} from 'rc-field-form/es/interface'

import {JoinedTable, JoinType, QueryOp, Table} from 'src/types/bi'
import {usePrevious} from 'src/util/hooks'
import FieldTypeIcon from 'src/components/FieldTypeIcon/FieldTypeIcon'
import {regExpRule} from 'src/util/form'
import styles from './JoinedTableForm.module.css'

interface JoinedTableFormProps {
  mainTable: Table
  joinedTable: JoinedTable
}

const {Text} = Typography

export default function JoinedTableForm(props: JoinedTableFormProps) {
  const {mainTable, joinedTable} = props
  const form = Form.useFormInstance()
  const {t} = useTranslation()
  const prevProps = usePrevious(props)

  useEffect(() => {
    const {mainTable: prevMainTable, joinedTable: prevJoinTable} = prevProps ?? {}
    if (mainTable.name !== prevMainTable?.name || joinedTable.name !== prevJoinTable?.name) form.resetFields()
  }, [mainTable, joinedTable])

  const mainTableFieldType =
    (joinFieldNumber: number): RuleRender =>
    ({getFieldValue}: FormInstance): RuleObject => ({
      validator(_, value) {
        const joinedTableField = getFieldValue(['joins', joinFieldNumber, 'field'])
        if (!value || !joinedTableField) return Promise.resolve()

        const mainTableFieldType = mainTable.columns[value].type
        const joinedTableFieldType = joinedTable.columns[joinedTableField].type
        if (mainTableFieldType === joinedTableFieldType) return Promise.resolve()

        return Promise.reject(new Error(t('Field types do not match')))
      }
    })

  const joinedFieldTypeRule =
    (joinFieldNumber: number): RuleRender =>
    ({getFieldValue}: FormInstance): RuleObject => ({
      validator(_, value) {
        const mainTableField = getFieldValue(['joins', joinFieldNumber, 'mainTableField'])
        if (!value || !mainTableField) return Promise.resolve()

        const mainTableFieldType = mainTable.columns[mainTableField].type
        const joinedTableFieldType = joinedTable.columns[value].type
        if (mainTableFieldType === joinedTableFieldType) return Promise.resolve()

        return Promise.reject(new Error(t('Field types do not match')))
      }
    })

  return (
    <>
      <Row gutter={10}>
        <Col span={9}>
          <span className={styles.tableHeader} title={mainTable.name}>
            <TableOutlined className="green" />
            &nbsp;&nbsp;
            <Text strong ellipsis>
              {mainTable.name}
            </Text>
          </span>
        </Col>
        <Col span={4}>
          <Form.Item
            name={['joinType']}
            className={styles.joinTypeFormItem}
            rules={[{required: true, message: t('Required field')}]}
          >
            <Select
              placeholder={t('Join type')}
              options={Object.values(JoinType).map(jt => ({value: jt, label: jt}))}
            />
          </Form.Item>
        </Col>
        <Col span={9} style={{textAlign: 'right'}}>
          <span className={styles.tableHeader} title={joinedTable.name}>
            <TableOutlined className="green" />
            &nbsp;&nbsp;
            <Text strong ellipsis>
              {joinedTable.name}
            </Text>
          </span>
        </Col>
      </Row>
      <Row gutter={10}>
        <Col offset={13} span={9}>
          <Form.Item name={['alias']} label={t('Alias')} rules={[regExpRule(/^\w+$/)]}>
            <Input placeholder={t('Alias')} />
          </Form.Item>
        </Col>
      </Row>

      <Form.List name={['joins']}>
        {(fields, {add, remove}) => (
          <>
            {fields.map(joinField => {
              const {key, name: joinFieldNumber, ...rest} = joinField
              return (
                <Row key={key} gutter={10}>
                  <Col span={9}>
                    <Form.Item
                      name={[joinFieldNumber, 'mainTableField']}
                      rules={[{required: true, message: t('Required field')}, mainTableFieldType(joinFieldNumber)]}
                    >
                      <Select
                        placeholder={t('Main table field')}
                        options={Object.keys(mainTable.columns).map(col => ({
                          value: col,
                          label: (
                            <span className="text-ellipsis">
                              <FieldTypeIcon fieldType={mainTable.columns[col].type} />
                              &nbsp;&nbsp;
                              {col}
                            </span>
                          )
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item name={[joinFieldNumber, 'op']} rules={[{required: true, message: t('Required field')}]}>
                      <Select
                        disabled
                        suffixIcon={null}
                        placeholder={t('Operator')}
                        options={[{value: QueryOp.$eq, label: '='}]}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={9}>
                    <Form.Item
                      name={[joinFieldNumber, 'field']}
                      rules={[{required: true, message: t('Required field')}, joinedFieldTypeRule(joinFieldNumber)]}
                    >
                      <Select
                        placeholder={t('Joined table field')}
                        options={Object.keys(joinedTable.columns).map(col => ({
                          value: col,
                          label: (
                            <span className="text-ellipsis">
                              <FieldTypeIcon fieldType={joinedTable.columns[col].type} />
                              &nbsp;&nbsp;
                              {col}
                            </span>
                          )
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={2}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      title={t('Remove')}
                      onClick={() => remove(joinFieldNumber)}
                    />
                  </Col>
                </Row>
              )
            })}
            <Row gutter={10}>
              <Col span={4}>
                <Button icon={<PlusCircleOutlined />} onClick={() => add({op: QueryOp.$eq})}>
                  {t('Add')}
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Form.List>
    </>
  )
}
