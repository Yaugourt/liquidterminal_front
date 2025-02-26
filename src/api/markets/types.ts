export interface Token {
    name: string
    logo: string | null
    price: number
    marketCap: number
    volume: number
    change24h: number
    liquidity: number
    supply: number
}

export interface PerpToken {
    name: string
    logo?: string | null
    price: number
    change24h: number
    volume: number
    openInterest: number
    funding: number
    maxLeverage: number
    onlyIsolated: boolean
}

export interface Auction {
    time: number
    deployer: string
    name: string
    deployGas: string
} 