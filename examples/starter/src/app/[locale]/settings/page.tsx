import { SimplePage } from '../simple-page';

export default function SettingsRoute({ params }: { params: Promise<{ locale: string }> }) {
  return <SimplePage params={params} page="settings" />;
}
