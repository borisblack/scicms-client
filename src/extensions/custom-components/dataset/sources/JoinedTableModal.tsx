import {useTranslation} from 'react-i18next'
import {Button, Col, Form, Modal, Row, Select, Space, Typography} from 'antd'
import {DeleteOutlined, PlusCircleOutlined, TableOutlined} from '@ant-design/icons'

import {JoinedTable, JoinType, QueryOp, Table} from 'src/types/bi'
import styles from './Sources.module.css'

interface JoinedTableModalProps {
    mainTable: Table
    joinedTable: JoinedTable
    open: boolean
    onChange: (joinedTable: Required<JoinedTable>) => void
    onClose: () => void
}

interface JoinsFormValues extends Required<JoinedTable>{}

const {Text} = Typography

export default function JoinedTableModal({mainTable, joinedTable, open, onChange, onClose}: JoinedTableModalProps) {
    const {t} = useTranslation()
    const [form] = Form.useForm()

    function handleFormFinish(values: JoinsFormValues) {
        onChange({...joinedTable, ...values})
        onClose()
    }

    return (
        <Modal
            title={t('Join')}
            open={open}
            destroyOnClose
            width={720}
            onOk={() => form.submit()}
            onCancel={onClose}
        >
            <Form
                form={form}
                layout="vertical"
                size="small"
                initialValues={joinedTable}
                onFinish={handleFormFinish}
            >
                <Row gutter={10}>
                    <Col span={9}>
                        <Space className={styles.tableHeader}>
                            <TableOutlined className="green"/>
                            <Text strong>{mainTable.name}</Text>
                        </Space>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name={['joinType']}
                            rules={[{required: true, message: t('Required field')}]}
                        >
                            <Select
                                placeholder={t('Join type')}
                                options={Object.values(JoinType).map(jt => ({key: jt, value: jt, label: jt}))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={9} style={{textAlign: 'right'}}>
                        <Space className={styles.tableHeader}>
                            <TableOutlined className="green"/>
                            <Text strong>{joinedTable.name}</Text>
                        </Space>
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
                                                rules={[
                                                    {required: true, message: t('Required field')},
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            const joinedTableField = getFieldValue(['joins', joinFieldNumber, 'field'])
                                                            if (!value || !joinedTableField)
                                                                return Promise.resolve()

                                                            const mainTableFieldType = mainTable.columns[value].type
                                                            const joinedTableFieldType = joinedTable.columns[joinedTableField].type
                                                            if (mainTableFieldType === joinedTableFieldType)
                                                                return Promise.resolve()

                                                            return Promise.reject(new Error(t('Field types do not match')))
                                                        },
                                                    })
                                                ]}
                                            >
                                                <Select
                                                    placeholder={t('Main table field')}
                                                    options={Object.keys(mainTable.columns).map(col => ({key: col, value: col, label: col}))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={4}>
                                            <Form.Item
                                                name={[joinFieldNumber, 'op']}
                                                rules={[{required: true, message: t('Required field')}]}
                                            >
                                                <Select
                                                    disabled
                                                    placeholder={t('Operator')}
                                                    options={[{key: QueryOp.$eq, value: QueryOp.$eq, label: '='}]}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={9}>
                                            <Form.Item
                                                name={[joinFieldNumber, 'field']}
                                                rules={[
                                                    {required: true, message: t('Required field')},
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            const mainTableField = getFieldValue(['joins', joinFieldNumber, 'mainTableField'])
                                                            if (!value || !mainTableField)
                                                                return Promise.resolve()

                                                            const mainTableFieldType = mainTable.columns[mainTableField].type
                                                            const joinedTableFieldType = joinedTable.columns[value].type
                                                            if (mainTableFieldType === joinedTableFieldType)
                                                                return Promise.resolve()

                                                            return Promise.reject(new Error(t('Field types do not match')))
                                                        },
                                                    })
                                                ]}
                                            >
                                                <Select
                                                    placeholder={t('Joined table field')}
                                                    options={Object.keys(joinedTable.columns).map(col => ({key: col, value: col, label: col}))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={2}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined/>}
                                                title={t('Remove')}
                                                onClick={() => remove(joinFieldNumber)}
                                            />
                                        </Col>
                                    </Row>
                                )
                            })}
                            <Row gutter={10}>
                                <Col span={4}>
                                    <Button
                                        icon={<PlusCircleOutlined/>}
                                        onClick={() => add({op: QueryOp.$eq})}
                                    >
                                        {t('Add')}
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    )
}