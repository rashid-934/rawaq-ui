import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconFileDescription } from '@tabler/icons-react';
import { Button, Text, TextInput } from '@mantine/core';
import {
  BentoCard,
  FormGrid,
  FormGridItem,
  PageHeader,
  PageSkeleton,
  RollingNumber,
  skeletonShapes,
  StatCard,
  StatGrid,
  WorkCard,
} from '../index';
import { CategoryBars, useStoryLocale, useWords, WeekBars } from './sample';
import classes from './sample.module.css';

// Each part on its own, on the haze, without the rail and the frame.

const meta: Meta = { title: 'Components' };
export default meta;

type Story = StoryObj;

function Headers() {
  const words = useWords();
  const locale = useStoryLocale();
  return (
    <div className={classes.padded}>
      <PageHeader
        title={words.nav.suppliers}
        count={16}
        description={words.suppliersHelp}
        actions={<Button>{words.addSupplier}</Button>}
        locale={locale}
        labels={words.labels}
      />
    </div>
  );
}

function Numbers() {
  const words = useWords();
  const [run, setRun] = useState(0);
  return (
    <div className={classes.padded} key={run}>
      <Text fz={32} fw={700} component="div">
        <RollingNumber value={128} className="tabular" />
      </Text>
      <Text fz={32} fw={700} component="div">
        <RollingNumber value={12480} text={words.stats[3].text} className="tabular" />
      </Text>
      <div>
        <Button variant="default" onClick={() => setRun((count) => count + 1)}>
          {words.replay}
        </Button>
      </div>
    </div>
  );
}

function Stats() {
  const words = useWords();
  return (
    <div className={classes.padded}>
      <StatGrid>
        {words.stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            {...stat}
            icon={index === 0 ? IconFileDescription : undefined}
            order={index}
          />
        ))}
      </StatGrid>
    </div>
  );
}

function Bars() {
  const words = useWords();
  const [run, setRun] = useState(0);
  return (
    <div className={classes.padded}>
      <BentoCard title={words.byCategory} key={`x${run}`}>
        <CategoryBars />
      </BentoCard>
      <BentoCard title={words.thisWeek} key={`y${run}`}>
        <WeekBars />
      </BentoCard>
      <div>
        <Button variant="default" onClick={() => setRun((count) => count + 1)}>
          {words.replay}
        </Button>
      </div>
    </div>
  );
}

function Skeletons() {
  const words = useWords();
  const locale = useStoryLocale();
  return (
    <div className={classes.padded}>
      {skeletonShapes.map((shape) => (
        <PageSkeleton key={shape} shape={shape} locale={locale} labels={words.labels} />
      ))}
    </div>
  );
}

function Form() {
  const words = useWords();
  return (
    <div className={classes.padded}>
      <WorkCard>
        <FormGrid>
          <FormGridItem>
            <TextInput label={words.fields.company} />
          </FormGridItem>
          <FormGridItem>
            <TextInput label={words.fields.city} />
          </FormGridItem>
          <FormGridItem wide>
            <TextInput label={words.fields.notes} />
          </FormGridItem>
        </FormGrid>
      </WorkCard>
    </div>
  );
}

/** The one-line header of a Work page: title, count, description, the action on the end side. */
export const PageHeaders: Story = { name: 'Page header', render: () => <Headers /> };

/** Big numbers: the digits roll into place once. Separators and units stay still. */
export const RollingNumbers: Story = { name: 'Rolling number', render: () => <Numbers /> };

/** Number cards of an Overview page. */
export const StatCards: Story = { name: 'Number cards', render: () => <Stats /> };

/** Bars grow once: horizontal from the start side, vertical from the bottom. */
export const GrowBars: Story = { name: 'Bars', render: () => <Bars /> };

/** The four loading shapes: overview, table, form and card. */
export const LoadingSkeletons: Story = { name: 'Loading skeleton', render: () => <Skeletons /> };

/** A Work card with fields in two columns and one wide field. */
export const FormGridInCard: Story = { name: 'Form grid', render: () => <Form /> };
