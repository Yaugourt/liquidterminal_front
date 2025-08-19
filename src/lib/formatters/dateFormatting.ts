import { DateFormatType } from '@/store/date-format.store';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(date: Date | string | number, format: DateFormatType): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  const dayPadded = day.toString().padStart(2, '0');
  const monthPadded = month.toString().padStart(2, '0');

  switch (format) {
    case 'DD_MM_YYYY':
      return `${dayPadded}/${monthPadded}/${year}`;
    
    case 'MM_DD_YYYY':
      return `${monthPadded}/${dayPadded}/${year}`;
    
    case 'YYYY_MM_DD':
      return `${year}-${monthPadded}-${dayPadded}`;
    
    case 'DD_MMM_YYYY':
      return `${day} ${MONTHS_SHORT[dateObj.getMonth()]} ${year}`;
    
    case 'MMM_DD_YYYY':
      return `${MONTHS_SHORT[dateObj.getMonth()]} ${day}, ${year}`;
    
    case 'DD_MMMM_YYYY':
      return `${day} ${MONTHS_FULL[dateObj.getMonth()]} ${year}`;
    
    case 'RELATIVE':
      return formatRelativeDate(dateObj);
    
    default:
      return `${dayPadded}/${monthPadded}/${year}`;
  }
}

export function formatDateTime(date: Date | string | number, format: DateFormatType): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  const dayPadded = day.toString().padStart(2, '0');
  const monthPadded = month.toString().padStart(2, '0');

  switch (format) {
    case 'DD_MM_YYYY':
      return `${dayPadded}/${monthPadded}/${year} ${timeStr}`;
    
    case 'MM_DD_YYYY':
      return `${monthPadded}/${dayPadded}/${year} ${timeStr}`;
    
    case 'YYYY_MM_DD':
      return `${year}-${monthPadded}-${dayPadded} ${timeStr}`;
    
    case 'DD_MMM_YYYY':
      return `${day} ${MONTHS_SHORT[dateObj.getMonth()]} ${year} ${timeStr}`;
    
    case 'MMM_DD_YYYY':
      return `${MONTHS_SHORT[dateObj.getMonth()]} ${day}, ${year} ${timeStr}`;
    
    case 'DD_MMMM_YYYY':
      return `${day} ${MONTHS_FULL[dateObj.getMonth()]} ${year} ${timeStr}`;
    
    case 'RELATIVE':
      return formatRelativeDateTime(dateObj);
    
    default:
      return `${dayPadded}/${monthPadded}/${year} ${timeStr}`;
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays === 0) {
    if (diffInHours === 0) {
      if (diffInMinutes < 1) {
        return 'just now';
      }
      return `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

function formatRelativeDateTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // Pour les dates très récentes (moins de 24h), on garde le format relatif détaillé
  if (diffInDays === 0) {
    if (diffInHours === 0) {
      if (diffInMinutes < 1) {
        return 'just now';
      }
      return `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  } 
  // Pour les dates plus anciennes, on affiche la date avec l'heure
  else {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    if (diffInDays === 1) {
      return `yesterday ${timeStr}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago ${timeStr}`;
    } else {
      // Pour les dates plus anciennes, format court avec heure
      const day = date.getDate();
      return `${day} ${MONTHS_SHORT[date.getMonth()]} ${timeStr}`;
    }
  }
} 