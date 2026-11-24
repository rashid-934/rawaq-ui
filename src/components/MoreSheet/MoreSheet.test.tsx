import { IconAdjustments, IconChartBar, IconPalette } from '@tabler/icons-react';
import { render, renderRtl, screen, userEvent, waitFor, within } from '../../test-utils';
import type { RailItem } from '../Rail/rail-items';
import { MoreSheet, type MoreSheetProps } from './MoreSheet';

const items: RailItem[] = [
  { key: 'reports', href: '/reports', label: 'Reports', icon: IconChartBar },
  { key: 'settings', href: '/settings', label: 'Settings', icon: IconAdjustments },
  { key: 'customize', href: '/customize', label: 'Customize', icon: IconPalette, highlight: true },
];

function sheet(props: Partial<MoreSheetProps> = {}) {
  return (
    <MoreSheet
      opened
      onClose={() => {}}
      user={{ name: 'Sara Ahmed', initials: 'SA', role: 'Procurement' }}
      company="Sample Trading"
      onSwitchCompany={() => {}}
      items={items}
      pathname="/settings"
      languages={[
        { value: 'en', label: 'English', lang: 'en' },
        { value: 'ar', label: 'العربية', lang: 'ar' },
        { value: 'ur', label: 'اردو', lang: 'ur' },
      ]}
      language="en"
      onLanguage={() => {}}
      onSignOut={() => {}}
      {...props}
    />
  );
}

describe('MoreSheet', () => {
  it('lists, top to bottom: the person, the company, the pages, the language and Sign out', async () => {
    render(sheet());
    const dialog = await screen.findByRole('dialog', { name: 'More' });
    const order = [
      'more-user',
      'more-company',
      'more-reports',
      'more-customize',
      'more-sign-out',
    ].map((id) => within(dialog).getByTestId(id));
    for (let index = 1; index < order.length; index += 1) {
      expect(order[index - 1]!.compareDocumentPosition(order[index]!)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    }
    expect(within(dialog).getByText('Sara Ahmed')).toBeVisible();
    expect(within(dialog).getByText('Procurement')).toBeVisible();
    expect(within(dialog).getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(dialog).getByTestId('more-customize')).toHaveAttribute('data-highlight');
  });

  it('switches company and language and signs out through the app', async () => {
    const onSwitchCompany = vi.fn();
    const onLanguage = vi.fn();
    const onSignOut = vi.fn();
    render(sheet({ onSwitchCompany, onLanguage, onSignOut }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Switch company: Sample Trading' })
    );
    expect(onSwitchCompany).toHaveBeenCalledTimes(1);
    // Buttons, so moving along them with the keyboard changes nothing.
    const english = screen.getByRole('button', { name: 'English', pressed: true });
    english.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(english);
    expect(onLanguage).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'العربية', pressed: false }));
    // The sheet closes and leaves the history first; then the language changes.
    await waitFor(() => expect(onLanguage).toHaveBeenCalledWith('ar'));
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('leaves out what the app does not give', async () => {
    render(
      sheet({
        user: null,
        company: undefined,
        languages: undefined,
        onSignOut: undefined,
      })
    );
    const dialog = await screen.findByRole('dialog', { name: 'More' });
    expect(within(dialog).queryByTestId('more-user')).toBeNull();
    expect(within(dialog).queryByTestId('more-company')).toBeNull();
    expect(within(dialog).queryByRole('group', { name: 'Language' })).toBeNull();
    expect(within(dialog).queryByTestId('more-sign-out')).toBeNull();
  });

  it('speaks Arabic and shows the theme switch the app passes', async () => {
    renderRtl(sheet({ locale: 'ar', themeSwitch: <span>Theme here</span> }));
    const dialog = await screen.findByRole('dialog', { name: 'المزيد' });
    expect(within(dialog).getByRole('button', { name: 'تسجيل الخروج' })).toBeInTheDocument();
    expect(within(dialog).getByText('Theme here')).toBeInTheDocument();
  });
});
