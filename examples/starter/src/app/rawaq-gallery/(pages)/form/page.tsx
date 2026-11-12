import { FormGrid, FormGridItem, PageHeader, WorkCard, WorkPage } from 'rawaq-ui';
import { Button, Checkbox, Group, NativeSelect, Textarea, TextInput } from '@mantine/core';
import { readLook } from '../../look';
import { galleryWords } from '../../words';

/** A form page: a required field, an invalid one with its message, and a disabled one. */
export default async function GalleryForm() {
  const { locale } = await readLook();
  const { form, work } = galleryWords[locale];
  return (
    <WorkPage
      header={<PageHeader title={form.title} description={form.description} locale={locale} />}
    >
      <WorkCard>
        <FormGrid>
          <TextInput label={form.company} required withAsterisk />
          <TextInput
            label={form.registration}
            defaultValue={form.registrationValue}
            error={form.registrationError}
            inputMode="numeric"
          />
          <TextInput label={form.number} value={form.numberValue} disabled readOnly />
          <NativeSelect label={form.city} data={work.cities} />
          <FormGridItem wide>
            <Textarea label={form.notes} placeholder={form.notesPlaceholder} autosize minRows={3} />
          </FormGridItem>
          <FormGridItem wide>
            <Checkbox label={form.welcome} defaultChecked />
          </FormGridItem>
          <FormGridItem wide>
            <Group gap="sm">
              <Button>{form.save}</Button>
              <Button variant="default" disabled>
                {form.saveDraft}
              </Button>
            </Group>
          </FormGridItem>
        </FormGrid>
      </WorkCard>
    </WorkPage>
  );
}
