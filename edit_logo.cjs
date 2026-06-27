const fs = require('fs');
let code = fs.readFileSync('src/components/Logo.tsx', 'utf8');

if (!code.includes('import { cn }')) {
  code = 'import { cn } from "../lib/utils";\n' + code;
}

code = code.replace(
  /<img (.*?)className=\{className\}(.*?)\/>/g,
  '<div className={cn("overflow-hidden rounded-full flex items-center justify-center shrink-0", className)}><img $1className="w-full h-full object-cover scale-[1.35] block" $2/></div>'
);

fs.writeFileSync('src/components/Logo.tsx', code);
console.log('Done');
