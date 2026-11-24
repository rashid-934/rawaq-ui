import { SimplePage } from '../simple-page';

export default function CustomizeRoute({ params }: { params: Promise<{ locale: string }> }) {
  return <SimplePage params={params} page="customize" />;
}
