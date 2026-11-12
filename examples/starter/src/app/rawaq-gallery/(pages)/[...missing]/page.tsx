import { notFound } from 'next/navigation';

/** Any other address under the gallery answers 404 with the gallery's not-found page. */
export default function MissingPage() {
  notFound();
}
