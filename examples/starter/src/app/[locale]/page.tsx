import type { CSSProperties } from 'react';
import { IconCoins, IconFileDescription, IconReceipt, IconScale } from '@tabler/icons-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Text } from '@mantine/core';
import {
  BentoCard,
  Emphasis,
  HeroBanner,
  OverviewPage,
  StatCard,
  StatGrid,
} from 'rawaq-ui';
import { Link } from '@/i18n/navigation';

// Sample numbers, so the page shows something. A real app reads them from its data.
const categories = [
  { key: 'it', share: 42 },
  { key: 'office', share: 27 },
  { key: 'services', share: 19 },
  { key: 'maintenance', share: 12 },
] as const;

/** An Overview page: a hero banner, number cards whose digits roll once, and bento cards. */
export default async function OverviewRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('overview');

  return (
    <OverviewPage
      side={
        <BentoCard title={t('today')} order={6}>
          <Text size="sm" c="dimmed">
            {t('todayText')}
          </Text>
        </BentoCard>
      }
    >
      <HeroBanner
        order={0}
        title={t.rich('hero', { em: (chunks) => <Emphasis>{chunks}</Emphasis> })}
        action={
          <Link href="/suppliers" className="starter-hero-action">
            {t('action')}
          </Link>
        }
      />
      <StatGrid>
        <StatCard
          label={t('openRequests')}
          value={12}
          hint={t('openRequestsHint')}
          icon={IconFileDescription}
          tint="green"
          order={1}
        />
        <StatCard
          label={t('awaitingQuotes')}
          value={7}
          hint={t('awaitingQuotesHint')}
          icon={IconScale}
          tint="amber"
          order={2}
        />
        <StatCard
          label={t('openOrders')}
          value={128}
          hint={t('openOrdersHint')}
          icon={IconReceipt}
          tint="slate"
          order={3}
        />
        <StatCard
          label={t('spend')}
          value={12480}
          text={t('spendText')}
          hint={t('spendHint')}
          icon={IconCoins}
          tint="clay"
          order={4}
        />
      </StatGrid>
      <BentoCard title={t('byCategory')} order={5}>
        {/* Bars that grow once from the start side: the `grow-x` class of Rawaq UI. */}
        <ul className="starter-bars">
          {categories.map(({ key, share }, index) => (
            <li key={key}>
              <span>{t(`categories.${key}`)}</span>
              <span className="starter-track" aria-hidden>
                <span
                  className="starter-fill grow-x"
                  style={{ '--value': `${share}%`, '--order': index } as CSSProperties}
                />
              </span>
              <span className="num">{`${share}%`}</span>
            </li>
          ))}
        </ul>
      </BentoCard>
    </OverviewPage>
  );
}
