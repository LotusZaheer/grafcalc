
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/grafcalc/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/grafcalc"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 20552, hash: '41dc1a112ae118236fb868c4868493135e676249f81a5e8de3d80fa0974dbf68', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1024, hash: '181694b95c6e3f316bb90a0eafbda87be0a3d52ccbf3d55581e70052e5fdea0e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 32554, hash: '6865c02acc8bab04f54f0f968b69421ede2e624e8856184c232a4db6638c1e44', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-COVNJEGA.css': {size: 21630, hash: 'l1qjRFS/9bI', text: () => import('./assets-chunks/styles-COVNJEGA_css.mjs').then(m => m.default)}
  },
};
