/**
 * Formate un nombre sans décimales avec des suffixes pour les grands nombres
 * @param num Nombre à formater
 * @returns Chaîne formatée (ex: "7B", "5M", "3K", "42")
 */
export function formatNumberWithoutDecimals(num: number): string {
    if (num >= 1000000000) {
        return `${Math.floor(num / 1000000000)} B`;
    } else if (num >= 1000000) {
        return `${Math.floor(num / 1000000)} M`;
    } else if (num >= 1000) {
        return `${Math.floor(num / 1000)} K`;
    } else {
        return Math.floor(num).toString();
    }
}

/**
 * Formate le temps restant en jours, heures, minutes et secondes
 * @param seconds Nombre de secondes restantes
 * @returns Chaîne formatée (ex: "2j 5h", "3h 45m", "2m 30s", "15s")
 */
export function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return "Commence bientôt";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}j ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
} 