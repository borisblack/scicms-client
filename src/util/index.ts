export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const associateBy = (arr: any[], key: string): {[name: string]: any} => {
    const obj: {[name: string]: any} = {}
    arr.forEach(it => {
        obj[it[key]] = it
    })

    return obj
}