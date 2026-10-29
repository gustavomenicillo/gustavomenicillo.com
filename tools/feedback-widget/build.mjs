// Arma src/assets.js con el widget (incluye modern-screenshot, MIT) y la bandeja como texto.
import { readFileSync, writeFileSync } from 'node:fs';
const r = (f) => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const widget = r('vendor-modern-screenshot.js') + '\n' + r('widget.js');
writeFileSync(new URL('./src/assets.js', import.meta.url),
  `// Generado por build.mjs: no editar a mano.\nexport const WIDGET_JS = ${JSON.stringify(widget)};\nexport const INBOX_HTML = ${JSON.stringify(r('inbox.html'))};\n`);
console.log('assets.js listo');
