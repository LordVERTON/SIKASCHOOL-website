type Language = 'fr' | 'en';
type Labels = Record<string, readonly [string, string]>;

const sessionLabels: Labels = {
  PENDING: ['En attente de confirmation', 'Awaiting confirmation'],
  SCHEDULED: ['Programmée', 'Scheduled'],
  IN_PROGRESS: ['En cours', 'In progress'],
  COMPLETED: ['Terminée', 'Completed'],
  CANCELLED: ['Annulée', 'Canceled'],
  CANCELED: ['Annulée', 'Canceled'],
};
const paymentLabels: Labels = {
  PENDING: ['En attente', 'Pending'],
  PAID: ['Payé', 'Paid'],
  COMPLETED: ['Payé', 'Paid'],
  FAILED: ['Échec du paiement', 'Payment failed'],
  REFUNDED: ['Remboursé', 'Refunded'],
  CANCELED: ['Annulé', 'Canceled'],
  CANCELLED: ['Annulé', 'Canceled'],
};
const subscriptionLabels: Labels = {
  ACTIVE: ['Actif', 'Active'],
  TRIALING: ['Période d’essai', 'Trial period'],
  PAST_DUE: ['Paiement en retard', 'Payment overdue'],
  UNPAID: ['Impayé', 'Unpaid'],
  CANCELED: ['Résilié', 'Canceled'],
  INCOMPLETE: ['À finaliser', 'Incomplete'],
  INCOMPLETE_EXPIRED: ['Expiré', 'Expired'],
  PAUSED: ['En pause', 'Paused'],
};
function label(labels: Labels, status: string | null | undefined, language: Language) {
  const key = status?.trim().toUpperCase() ?? '';
  const values = Object.hasOwn(labels, key) ? labels[key] : null;
  return values?.[language === 'fr' ? 0 : 1]
    ?? (language === 'fr' ? 'Statut indisponible' : 'Status unavailable');
}
export function getSessionStatusLabel(status: string | null | undefined, language: Language = 'fr') {
  return label(sessionLabels, status, language);
}
export function getPaymentStatusLabel(status: string | null | undefined, language: Language = 'fr') {
  return label(paymentLabels, status, language);
}
export function getSubscriptionStatusLabel(status: string | null | undefined, language: Language = 'fr') {
  return label(subscriptionLabels, status, language);
}
