import pngToIco from 'png-to-ico';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function generateFavicon() {
  const ico = await pngToIco([
    join(publicDir, 'favicon-16.png'),
    join(publicDir, 'favicon-32.png'),
  ]);
  writeFileSync(join(publicDir, 'favicon.ico'), ico);
  console.log('Generated favicon.ico');
}

generateFavicon().catch(console.error);
