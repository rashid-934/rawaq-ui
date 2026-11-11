import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCoins, IconFileDescription, IconReceipt, IconScale } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  BentoCard,
  Emphasis,
  FormGrid,
  FormGridItem,
  HeroBanner,
  IntroReveal,
  type KpiTint,
  OverviewPage,
  PageHeader,
  PageSkeleton,
  pageTableProps,
  StatCard,
  StatGrid,
  TableWrap,
  WorkCard,
  WorkPage,
} from '../index';
import { AppShell, CategoryBars, StoryLink, useStoryLocale, useWords, WeekBars } from './sample';
import classes from './sample.module.css';

// Whole screens, as an app puts them together: the rail, the frame and a page. Use the toolbar
// to change the language, the preset, the sidebar colour and the density.

const meta: Meta = { title: 'Screens' };
export default meta;

type Story = StoryObj;

const statIcons = [IconFileDescription, IconScale, IconReceipt, IconCoins];
const statTints: KpiTint[] = ['green', 'amber', 'slate', 'clay'];
const statPages = ['requests', 'requests', 'reports', 'reports'];

function OverviewContent() {
  const words = useWords();
  return (
    <OverviewPage
      side={
        <BentoCard title={words.today} order={7}>
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
            {words.heroHello} {words.heroBefore}
            <Emphasis>{words.heroEmphasis}</Emphasis>
            {words.heroAfter}
          </>
        }
        action={
          <Button color="highlight" radius="xl">
            {words.heroAction}
          </Button>
        }
      />
      <StatGrid>
        {words.stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            {...stat}
            icon={statIcons[index]}
            tint={statTints[index]}
            href={`/app/${statPages[index]}`}
            linkComponent={StoryLink}
            order={index + 1}
          />
        ))}
      </StatGrid>
      <BentoCard span={8} title={words.byCategory} order={5}>
        <CategoryBars />
      </BentoCard>
      <BentoCard span={4} title={words.thisWeek} order={6}>
        <WeekBars />
      </BentoCard>
    </OverviewPage>
  );
}

function SuppliersContent() {
  const words = useWords();
  const locale = useStoryLocale();
  const rows = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    name: `${words.supplier} ${index + 1}`,
    category: words.categories[index % words.categories.length]?.name,
    city: words.cities[index % words.cities.length],
    orders: (index * 7) % 23,
    approved: index % 3 !== 0,
  }));
  return (
    <WorkPage
      header={
        <PageHeader
          title={words.nav.suppliers}
          count={rows.length}
          description={words.suppliersHelp}
          actions={<Button>{words.addSupplier}</Button>}
          locale={locale}
          labels={words.labels}
        />
      }
      filters={
        <TextInput aria-label={words.searchSuppliers} placeholder={words.searchSuppliers} w={280} />
      }
    >
      <TableWrap>
        <Table {...pageTableProps}>
          <TableThead>
            <TableTr>
              <TableTh>{words.columns.name}</TableTh>
              <TableTh>{words.columns.category}</TableTh>
              <TableTh>{words.columns.city}</TableTh>
              <TableTh className="num">{words.columns.orders}</TableTh>
              <TableTh>{words.columns.status}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {rows.map((row) => (
              <TableTr key={row.id}>
                <TableTd>{row.name}</TableTd>
                <TableTd>{row.category}</TableTd>
                <TableTd>{row.city}</TableTd>
                <TableTd className="num">{row.orders}</TableTd>
                <TableTd>
                  <Badge variant={row.approved ? 'light' : 'default'}>
                    {row.approved ? words.approved : words.underReview}
                  </Badge>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableWrap>
    </WorkPage>
  );
}

function FormContent() {
  const words = useWords();
  const locale = useStoryLocale();
  return (
    <WorkPage
      width="form"
      header={<PageHeader title={words.newSupplier} locale={locale} labels={words.labels} />}
    >
      <WorkCard>
        <FormGrid>
          <FormGridItem>
            <TextInput label={words.fields.company} required />
          </FormGridItem>
          <FormGridItem>
            <TextInput label={words.fields.registration} />
          </FormGridItem>
          <FormGridItem>
            <TextInput label={words.fields.city} />
          </FormGridItem>
          <FormGridItem wide>
            <Textarea label={words.fields.notes} minRows={3} autosize />
          </FormGridItem>
        </FormGrid>
      </WorkCard>
      <div>
        <Button>{words.save}</Button>
      </div>
    </WorkPage>
  );
}

function OpeningScreen() {
  const words = useWords();
  const [run, setRun] = useState(0);
  return (
    <AppShell
      pageKind="overview"
      after={
        <>
          <IntroReveal key={run} appName={words.appName} />
          <div className={classes.controls}>
            <Button variant="default" onClick={() => setRun((count) => count + 1)}>
              {words.replay}
            </Button>
          </div>
        </>
      }
    >
      <OverviewContent />
    </AppShell>
  );
}

function LoadingScreen() {
  const words = useWords();
  const locale = useStoryLocale();
  return (
    <AppShell pageKind="work" path="/app/suppliers">
      <PageSkeleton shape="table" locale={locale} labels={words.labels} />
    </AppShell>
  );
}

/** An Overview page: the hero banner, number cards whose digits roll, and bento cards. */
export const Overview: Story = {
  render: () => (
    <AppShell pageKind="overview">
      <OverviewContent />
    </AppShell>
  ),
};

/** A Work page: a one-line header with a count, filters, and a dense table with a sticky header. */
export const WorkPageWithTable: Story = {
  name: 'Work page',
  render: () => (
    <AppShell pageKind="work" path="/app/suppliers">
      <SuppliersContent />
    </AppShell>
  ),
};

/** A Work page read like a document: one centred column, fields in two columns. */
export const FormPage: Story = {
  render: () => (
    <AppShell pageKind="work" path="/app/suppliers/new">
      <FormContent />
    </AppShell>
  ),
};

/** The rail as a labelled panel ("Show labels" on): the frame starts further in. */
export const WithLabels: Story = {
  name: 'Rail with labels',
  render: () => (
    <AppShell pageKind="work" path="/app/suppliers" labelsOpen>
      <SuppliersContent />
    </AppShell>
  ),
};

/** What a page looks like while it loads. */
export const Loading: Story = { render: () => <LoadingScreen /> };

/** The opening, as after a sign-in. It never shows with reduced motion. */
export const Opening: Story = { render: () => <OpeningScreen /> };

/** Another language than the two built in: right-to-left, its own font and its own words. */
export const UrduOverview: Story = {
  name: 'Overview in Urdu',
  globals: { locale: 'ur' },
  render: () => (
    <AppShell pageKind="overview">
      <OverviewContent />
    </AppShell>
  ),
};

export const UrduWorkPage: Story = {
  name: 'Work page in Urdu',
  globals: { locale: 'ur' },
  render: () => (
    <AppShell pageKind="work" path="/app/suppliers">
      <SuppliersContent />
    </AppShell>
  ),
};
