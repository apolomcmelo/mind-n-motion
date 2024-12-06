/** @type {import("snowpack").SnowpackUserConfig } */

import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [
    [
      '@snowpack/plugin-typescript',
      {
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
  ],
  routes: [],
  packageOptions: {
    polyfillNode: false,
    rollup: {
      plugins: [
          nodePolyfills()
      ],
    },
  }
};
