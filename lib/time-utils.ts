/**
 * Fonction utilitaire pour formater les heures en format "2h30min"
 * @param decimalHours - Nombre d'heures en format décimal (ex: 2.5)
 * @returns String formatée (ex: "2h30min")
 */
export const formatHours = (decimalHours: number): string => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  } else if (hours === 0) {
    return `${minutes}min`;
  } else {
    return `${hours}h${minutes}min`;
  }
};

/**
 * Fonction utilitaire pour formater les minutes en format "2h30min"
 * @param minutes - Nombre de minutes
 * @returns String formatée (ex: "2h30min")
 */
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  } else if (hours === 0) {
    return `${remainingMinutes}min`;
  } else {
    return `${hours}h${remainingMinutes}min`;
  }
};
