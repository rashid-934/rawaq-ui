module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
        // 1280 px: the desktop layout starts here. Phone rules sit below `sm` (768 px), tablet
        // rules between `sm` and this one, so nothing at 1280 px and wider changes.
        'rq-desktop': '80em',
      },
    },
  },
};
