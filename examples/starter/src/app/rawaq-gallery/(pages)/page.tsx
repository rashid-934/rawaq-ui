import type { CSSProperties } from 'react';
import Link from 'next/link';
import { IconCoins, IconFileDescription, IconReceipt, IconScale } from '@tabler/icons-react';
import { BentoCard, Emphasis, HeroBanner, OverviewPage, StatCard, StatGrid } from 'rawaq-ui';
import { Text } from '@mantine/core';
import { readLook } from '../look';
import { GALLERY_BASE } from '../look-shared';
import { galleryWords } from '../words';

const shares = [42, 27, 19, 12];

/** An Overview page: hero banner, number cards whose digits roll once, bento cards. */
export default async function GalleryOverview() {
  const { locale } = await readLook();
  const words = galleryWords[locale].overview;
  const [requests, quotes, orders, spend] = words.stats;

  return (
    <OverviewPage
      side={
        <BentoCard title={words.today} order={6}>
          <Text size="sm" c="dimmed">
            {words.todayText}
          </Text>
        </BentoCard>
      }
    >
      <HeroBanner
        order={0}
        title={
          <>
            {words.heroBefore}
            <Emphasis>{words.heroEmphasis}</Emphasis>
            {words.heroAfter}
          </>
        }
        action={
          <Link href={`${GALLERY_BASE}/work`} className="starter-hero-action">
            {words.action}
          </Link>
        }
      />
      <StatGrid>
        <StatCard
          label={requests.label}
          value={12}
          hint={requests.hint}
          icon={IconFileDescription}
          tint="green"
          order={1}
        />
        <StatCard
          label={quotes.label}
          value={7}
          hint={quotes.hint}
          icon={IconScale}
          tint="amber"
          order={2}
        />
        <StatCard
          label={orders.label}
          value={128}
          hint={orders.hint}
          icon={IconReceipt}
          tint="slate"
          order={3}
        />
        <StatCard
          label={spend.label}
          value={12480}
          text={words.spendText}
          hint={spend.hint}
          icon={IconCoins}
          tint="clay"
          order={4}
        />
      </StatGrid>
      <BentoCard title={words.byCategory} order={5}>
        <ul className="starter-bars">
          {words.categories.map((name, index) => (
            <li key={name}>
              <span>{name}</span>
              <span className="starter-track" aria-hidden>
                <span
                  className="starter-fill grow-x"
                  style={{ '--value': `${shares[index]}%`, '--order': index } as CSSProperties}
                />
              </span>
              <span className="num">{`${shares[index]}%`}</span>
            </li>
          ))}
        </ul>
      </BentoCard>
    </OverviewPage>
  );
}
