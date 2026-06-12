import fs from 'fs';

(async () => {
  try {
    let res = await fetch('https://drive.google.com/uc?export=download&id=1FYNPuORkiztfAqhhec7JR-987iU1hVcz');
    let buffer = Buffer.from(await res.arrayBuffer());
    let text = buffer.toString('utf-8');
    if (text.includes('confirm=')) {
      const match = text.match(/confirm=([a-zA-Z0-9_-]+)/);
      if (match) {
         res = await fetch('https://drive.google.com/uc?export=download&id=1FYNPuORkiztfAqhhec7JR-987iU1hVcz&confirm=' + match[1]);
         buffer = Buffer.from(await res.arrayBuffer());
      }
    }
    if(buffer.length < 500) {
        console.log(buffer.toString('utf-8').slice(0, 500));
        console.log('Failed to fetch image properly. Response too small.');
        return;
    }
    const b64 = 'data:image/png;base64,' + buffer.toString('base64');
    fs.writeFileSync('src/components/Logo.tsx', 'export const HuggingFaceLogo = ({ className }: { className?: string }) => <img src=\"' + b64 + '\" alt=\"Brand Logo\" className={className} />;\n');
    console.log('done buffer size: ' + Math.round(buffer.length/1024) + 'kb');
  } catch (err) {
    console.error(err);
  }
})();
