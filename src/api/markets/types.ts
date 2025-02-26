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

export interface Auction {
    time: number
    deployer: string
    name: string
    deployGas: string
} 