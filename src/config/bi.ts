interface BiConfig {
    cols: number
    rowHeight: number
    defaultDashType: string
    defaultDashHeight: number
    defaultPageSize: number
    defaultRefreshIntervalSeconds: number
    locale: string
    maxPageSize: number
    minRefreshIntervalSeconds: number
    openFirstDashboard: boolean
    fractionDigits: number
    percentFractionDigits: number
    dateTime: {
        dateFormatString: string
        timeFormatString: string
        dateTimeFormatString: string
    }
    dash: {
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
        }
        doughnut?: {
            labelStyle: {
                [key: string]: any
            }
            statistic?: {
                title?: false
            }
        }
        map: {
            urlTemplate: string
            defaultZoom: number
            maxZoom: number
            centerPosition?: {
                latitude: number
                longitude: number
            }
            defaultSize: number
        }
        pie?: {
            labelStyle: {
                [key: string]: any
            }
        }
        statistic?: {
            color?: string
        }
    }
}

const biConfig: BiConfig = {
    cols: 24,
    rowHeight: 100,
    defaultDashType: 'bar',
    defaultDashHeight: 3,
    defaultPageSize: 100,
    defaultRefreshIntervalSeconds: 300,
    locale: 'ru-RU',
    maxPageSize: 1000,
    minRefreshIntervalSeconds: 5,
    openFirstDashboard: true,
    fractionDigits: 2,
    percentFractionDigits: 2,
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
        map: {
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            defaultZoom: 9,
            maxZoom: 19,
            centerPosition: {
                latitude: 56.12,
                longitude: 93.0
            },
            defaultSize: 100
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