// Soft KPI card tints, a background and a text colour each (docs/DESIGN_THEME.md section 2).
// The design gives one set; every preset uses it until a preset needs its own.

export const kpiTintKeys = ['green', 'amber', 'slate', 'clay'] as const;

export type KpiTint = (typeof kpiTintKeys)[number];

export const kpiTints: Record<KpiTint, { background: string; text: string }> = {
  green: { background: '#E3EFE7', text: '#1F5A42' },
  amber: { background: '#F6E9CC', text: '#7A5212' },
  slate: { background: '#E2E8EC', text: '#2F4858' },
  clay: { background: '#F3DDD3', text: '#8A3A22' },
};
