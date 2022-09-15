export function tryParseJson(value: any): boolean {
    try {
        return JSON.parse(value)
    } catch (e) {
        return value
    }
}

export const getBit = (num: number, i: number) => (num & (1 << i)) !== 0

export const setBit = (num: number, i: number) => num | (1 << i)

export const clearBit = (num: number, i: number) => {
    const mask = ~(1 << i)
    return num & mask
}