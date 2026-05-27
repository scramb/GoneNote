import { branding } from '$lib/branding';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
  return {
    branding: {
      appName: branding.appName,
      logoUrl: branding.logoUrl,
      colors: branding.colors,
    },
  };
};
