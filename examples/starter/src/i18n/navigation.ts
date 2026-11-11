import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Links and the current address without the language prefix: what Rawaq UI's rail and frame take.
export const { Link, usePathname, useRouter } = createNavigation(routing);
