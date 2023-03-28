interface BiConfig {
    locale: string
    cols: number
    specRowHeight: number
    viewRowHeight: number
    minRefreshIntervalSeconds: number
    defaultRefreshIntervalSeconds: number
    defaultDashType: string
    defaultPageSize: number
    maxPageSize: number
    openFirstDashboard: boolean
    dateTime: {
        dateFormatString: string
        timeFormatString: string
        dateTimeFormatString: string
    }
    dash?: {
        all?: {
            color: string | string[]
            legend?: {
                label?: {
                    style?: {
                        [key: string]: any
                    }
                },
                itemName?: {
                    style?: {
                        [key: string]: any
                    }
                }
            }
            axisLabelStyle?: {
                [key: string]: any
            }
        },
        doughnut?: {
            labelStyle: {
                [key: string]: any
            }
        },
        pie?: {
            labelStyle: {
                [key: string]: any
            }
        },
        statistic?: {
            color?: string
        }
    }
}

const biConfig: BiConfig = {
    locale: 'ru-RU',
    cols: 24,
    specRowHeight: 100,
    viewRowHeight: 300,
    minRefreshIntervalSeconds: 5,
    defaultRefreshIntervalSeconds: 300,
    defaultDashType: 'bar',
    defaultPageSize: 100,
    maxPageSize: 1000,
    openFirstDashboard: true,
    dateTime: {
        dateFormatString: 'DD.MM.YYYY',
        timeFormatString: 'HH:mm',
        dateTimeFormatString: 'DD.MM.YYYY HH:mm',
    },
    dash: {
        doughnut: {
            labelStyle: {
                textAlign: 'center',
                fontSize: 14
            }
        },
        pie: {
            labelStyle: {
                textAlign: 'center',
                fontSize: 14
            }
        },
        statistic: {
            color: '#333366'
        },
    }
}

export default biConfig