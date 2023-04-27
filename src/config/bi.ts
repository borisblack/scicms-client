interface BiConfig {
    cols: number
    defaultDashType: string
    defaultPageSize: number
    defaultRefreshIntervalSeconds: number
    locale: string
    maxPageSize: number
    minRefreshIntervalSeconds: number
    specRowHeight: number
    viewRowHeight: number
    openFirstDashboard: boolean
    percentFractionDigits: number
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
    cols: 24,
    defaultDashType: 'bar',
    defaultPageSize: 100,
    defaultRefreshIntervalSeconds: 300,
    locale: 'ru-RU',
    maxPageSize: 1000,
    minRefreshIntervalSeconds: 5,
    openFirstDashboard: true,
    percentFractionDigits: 2,
    specRowHeight: 100,
    viewRowHeight: 300,
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