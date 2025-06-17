
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
    'index.csr.html': {size: 20552, hash: 'a59a7d7cdc47998f5bf91a2359d4e4fc0c4ffa39214469132a748f37c00ed6ce', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1024, hash: 'e0debeee2b8f62390c474c551a91045209b5748be5173cde7764951420cc8b0e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 34216, hash: 'c2b72ccbb4e1a0bf6c91d9c1f8d03f17989ad7b1f18fc57d525cd6ed3d8ccdcc', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-COVNJEGA.css': {size: 21630, hash: 'l1qjRFS/9bI', text: () => import('./assets-chunks/styles-COVNJEGA_css.mjs').then(m => m.default)}
  },
};
