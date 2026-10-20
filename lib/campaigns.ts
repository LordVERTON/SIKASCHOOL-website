export type PublicCampaign = {
  id: 'back_to_school';
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

// No approved future period is available. Keep historical IDs for lead attribution.
export const PUBLIC_CAMPAIGNS: readonly PublicCampaign[] = [
  { id: 'back_to_school', enabled: false, startsAt: null, endsAt: null },
];

/** Dates must include a timezone; the end boundary is exclusive. */
export function isCampaignActive(
  campaign: PublicCampaign,
  now = new Date()
): boolean {
  if (!campaign.enabled || !campaign.startsAt || !campaign.endsAt) return false;
  const zoned = /(Z|[+-]\d{2}:\d{2})$/;
  if (!zoned.test(campaign.startsAt) || !zoned.test(campaign.endsAt))
    return false;
  const start = Date.parse(campaign.startsAt);
  const end = Date.parse(campaign.endsAt);
  const time = now.getTime();
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end > start &&
    time >= start &&
    time < end
  );
}

export function getActiveCampaign(now = new Date()) {
  return (
    PUBLIC_CAMPAIGNS.find(campaign => isCampaignActive(campaign, now)) ?? null
  );
}
