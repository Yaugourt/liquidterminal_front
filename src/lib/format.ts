type NumberType = 'price' | 'volume' | 'marketCap' | 'change' | 'default'

export const formatNumber = (num: number, type: NumberType = 'default') => {
    const options: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 0,
    }

    switch (type) {
        case 'price':
            options.maximumFractionDigits = 5
            break
        case 'change':
            options.maximumFractionDigits = 2
            break
        case 'volume':
        case 'marketCap':
            options.maximumFractionDigits = 0
            break
        default:
            options.maximumFractionDigits = 2
    }

    return new Intl.NumberFormat('en-US', options).format(num)
} 