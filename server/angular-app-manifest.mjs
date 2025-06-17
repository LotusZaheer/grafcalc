
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://LotusZaheer.github.io/grafcalc/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/grafcalc"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 20581, hash: 'a088190ee8dc1ed6d8b4383d5805493529b98d68c816db6e0a3af562652242b1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1053, hash: '01a6ed0b48c7ea9686f3805625227ae678c8070c743b10fd21eea9f65b66d21f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 34245, hash: 'd177db5df6328d29982e8148832275dd98377baca108540c02143a65b5015243', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-COVNJEGA.css': {size: 21630, hash: 'l1qjRFS/9bI', text: () => import('./assets-chunks/styles-COVNJEGA_css.mjs').then(m => m.default)}
  },
};
