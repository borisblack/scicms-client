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
            colors10?: string[]
            colors20?: string[]
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
        all: {
            colors10: [
                "#5B8FF9",
                "#5AD8A6",
                "#5D7092",
                "#F6BD16",
                "#6F5EF9",
                "#6DC8EC",
                "#945FB9",
                "#FF9845",
                "#1E9493",
                "#FF99C3"
            ],
            colors20: [
                "#5B8FF9",
                "#CDDDFD",
                "#5AD8A6",
                "#CDF3E4",
                "#5D7092",
                "#CED4DE",
                "#F6BD16",
                "#FCEBB9",
                "#6F5EF9",
                "#D3CEFD",
                "#6DC8EC",
                "#D3EEF9",
                "#945FB9",
                "#DECFEA",
                "#FF9845",
                "#FFE0C7",
                "#1E9493",
                "#BBDEDE",
                "#FF99C3",
                "#FFE0ED"
            ]
        },
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