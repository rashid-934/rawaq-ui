import { SimplePage } from '../simple-page';

export default function ReportsRoute({ params }: { params: Promise<{ locale: string }> }) {
  return <SimplePage params={params} page="reports" />;
}
