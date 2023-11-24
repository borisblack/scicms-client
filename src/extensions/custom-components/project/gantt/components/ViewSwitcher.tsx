import {ViewMode} from 'gantt-task-react'
import {useTranslation} from 'react-i18next'
import {ReloadOutlined} from '@ant-design/icons'
import React from 'react'
import {Button, Checkbox, Radio, Space} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import 'gantt-task-react/dist/index.css'
import styles from './ViewSwitcher.module.css'

interface ViewSwitcherProps {
    viewMode: ViewMode
    showTaskList: boolean
    topLevelTasksOnly: boolean
    onViewModeChange: (viewMode: ViewMode) => void
    onShowTaskListChange: (showTaskList: boolean) => void
    onTopLevelTasksOnly: (topLevelTasksOnly: boolean) => void
    onRefresh: () => void
}

export default function ViewSwitcher(
    {viewMode, showTaskList, topLevelTasksOnly, onViewModeChange, onShowTaskListChange, onTopLevelTasksOnly, onRefresh}: ViewSwitcherProps
) {
    const {t} = useTranslation()

    function handleShowTaskListChange(e: CheckboxChangeEvent) {
        onShowTaskListChange(e.target.checked)
    }

    function handleTopLevelTasksOnlyChange(e: CheckboxChangeEvent) {
        onTopLevelTasksOnly(e.target.checked)
    }

    return (
        <div className={styles.viewContainer}>
            <Space>
                <Checkbox checked={showTaskList} onChange={handleShowTaskListChange}>
                    {t('Show Task List')}
                </Checkbox>

                <Radio.Group
                    size="small"
                    value={viewMode}
                    onChange={(e) => onViewModeChange(e.target.value)}
                >
                    <Radio.Button value={ViewMode.Hour}>{t('Hour')}</Radio.Button>
                    <Radio.Button value={ViewMode.QuarterDay}>{t('Quarter of Day')}</Radio.Button>
                    <Radio.Button value={ViewMode.HalfDay}>{t('Half of Day')}</Radio.Button>
                    <Radio.Button value={ViewMode.Day}>{t('Day')}</Radio.Button>
                    <Radio.Button value={ViewMode.Week}>{t('Week')}</Radio.Button>
                    <Radio.Button value={ViewMode.Month}>{t('Month')}</Radio.Button>
                    <Radio.Button value={ViewMode.Year}>{t('Year')}</Radio.Button>
                </Radio.Group>

                <Checkbox checked={topLevelTasksOnly} onChange={handleTopLevelTasksOnlyChange}>
                    {t('Top Level Tasks Only')}
                </Checkbox>

                <Button size="small" icon={<ReloadOutlined/>} onClick={onRefresh}>
                    {t('Refresh')}
                </Button>
            </Space>
        </div>
    )
}