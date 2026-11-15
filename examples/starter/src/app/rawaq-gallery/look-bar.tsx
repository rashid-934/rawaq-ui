'use client';

import { useState } from 'react';
import { densityKeys, presetKeys, sidebarChoices } from 'rawaq-ui/tokens';
import { Button, NativeSelect } from '@mantine/core';
import {
  GALLERY_BASE,
  GALLERY_LOCALES,
  type GalleryLook,
  LOOK_COOKIE,
  lookValue,
} from './look-shared';
import type { GalleryWords } from './words';

export interface LookBarProps {
  look: GalleryLook;
  words: GalleryWords;
}

/**
 * The switches of the gallery: preset, sidebar colour, density and language. "Apply" saves the
 * choice in the cookie and loads the page again, so the server draws it in the new look from the
 * first frame (the way an app reads a company's saved look). A switch alone changes nothing: with
 * the arrow keys a closed list changes its value at once, and a reload on every key would lose
 * the keyboard's place (WCAG 3.2.2).
 */
export function LookBar({ look, words }: LookBarProps) {
  const [chosen, setChosen] = useState<GalleryLook>(look);
  const apply = () => {
    // Preferences only, no secret. An app that keeps real settings in a cookie adds `secure`.
    document.cookie = `${LOOK_COOKIE}=${lookValue(chosen)}; path=${GALLERY_BASE}; max-age=31536000; samesite=lax`;
    window.location.reload();
  };
  const lists = [
    {
      key: 'preset',
      label: words.look.preset,
      data: presetKeys.map((value) => ({ value, label: words.presets[value] })),
    },
    {
      key: 'sidebar',
      label: words.look.sidebar,
      data: sidebarChoices.map((value) => ({ value, label: words.sidebars[value] })),
    },
    {
      key: 'density',
      label: words.look.density,
      data: densityKeys.map((value) => ({ value, label: words.densities[value] })),
    },
    {
      key: 'locale',
      label: words.look.language,
      data: GALLERY_LOCALES.map((value) => ({ value, label: words.languages[value] })),
    },
  ] as const;

  return (
    <div className="gallery-look" role="group" aria-label={words.look.title}>
      {lists.map(({ key, label, data }) => (
        <NativeSelect
          key={key}
          size="xs"
          label={label}
          value={chosen[key]}
          data={[...data]}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setChosen((current) => ({ ...current, [key]: value }) as GalleryLook);
          }}
          data-testid={`look-${key}`}
        />
      ))}
      <Button size="xs" variant="default" onClick={apply} data-testid="look-apply">
        {words.look.apply}
      </Button>
    </div>
  );
}
