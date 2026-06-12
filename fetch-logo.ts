import https from 'https';
import fs from 'fs';

https.get('https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg', (res) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const b64 = 'data:image/jpeg;base64,' + buffer.toString('base64');
    fs.writeFileSync('src/logo.ts', 'export const LogoBase64 = \'' + b64 + '\';\n');
    console.log('done');
  });
});
