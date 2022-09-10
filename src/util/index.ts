export function tryParseJson(value: any): boolean {
    try {
        return JSON.parse(value)
    } catch (e) {
        return value
    }
}