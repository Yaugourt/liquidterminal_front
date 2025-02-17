export const formatNumber = (num: number, maxDecimals = 5) => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
    }).format(num)
} 