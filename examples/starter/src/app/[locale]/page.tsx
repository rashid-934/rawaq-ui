import type { CSSProperties } from 'react';
import { IconCoins, IconFileDescription, IconReceipt, IconScale } from '@tabler/icons-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Badge, Text } from '@mantine/core';
import {
  ActivityList,
  BentoCard,
  Emphasis,
  HeroBanner,
  NeedsYouList,
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
  const all = await getTranslations();

  return (
    <OverviewPage
      side={
        <>
          <BentoCard title={t('today')} order={6}>
            <Text size="sm" c="dimmed">
              {t('todayText')}
            </Text>
          </BentoCard>
          <BentoCard title={all('activity.title')} order={7}>
            <ActivityList
              linkComponent={Link}
              items={[
                { key: 'chairs', title: all('requests.rows.chairs'), reference: 'REQ-2611-0012', status: 'new' },
                { key: 'barrier', title: all('requests.rows.barrier'), reference: 'REQ-2611-0011', status: 'waiting' },
                { key: 'vests', title: all('requests.rows.vests'), reference: 'REQ-2611-0009', status: 'new' },
              ].map((row) => ({
                ...row,
                href: '/requests',
                status: (
                  <Badge variant={row.status === 'new' ? 'light' : 'outline'}>
                    {row.status === 'new' ? all('requests.statusNew') : all('requests.waiting')}
                  </Badge>
                ),
              }))}
            />
          </BentoCard>
        </>
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
      >
        {/* Up to three things to do; the first is marked "Do next". */}
        <NeedsYouList
          linkComponent={Link}
          locale={locale}
          items={[
            { key: 'approve', action: all('needs.approve'), subject: all('needs.approveSubject'), href: '/requests' },
            { key: 'compare', action: all('needs.compare'), subject: 'RFQ-2611-0004', href: '/quotes' },
            { key: 'send', action: all('needs.send'), subject: 'PO-2611-0009', href: '/requests' },
          ]}
        />
      </HeroBanner>
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
          text="12,480"
          currency="SAR"
          locale={locale}
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
