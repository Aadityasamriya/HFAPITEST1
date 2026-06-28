const fs = require('fs');
const newB64 = fs.readFileSync('new_base64.txt', 'utf8');

const code = `import { cn } from "../lib/utils";

export const HuggingFaceLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center shrink-0", className)}>
    <img 
      src={\`data:image/png;base64,${newB64}\`} 
      alt="Brand Logo" 
      className="w-full h-full object-contain scale-[1.5] block"  
    />
  </div>
);
`;

fs.writeFileSync('src/components/Logo.tsx', code);
console.log('Updated Logo.tsx');
