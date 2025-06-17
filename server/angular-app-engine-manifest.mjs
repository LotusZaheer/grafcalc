
export default {
  basePath: 'https://LotusZaheer.github.io/grafcalc',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
