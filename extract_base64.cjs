const fs = require('fs');
const content = fs.readFileSync('src/components/Logo.tsx', 'utf8');
const match = content.match(/data:image\/[^;]+;base64,([^"']+)/);
if (match) {
  fs.writeFileSync('original_base64.txt', match[1]);
  console.log('Saved original_base64.txt');
} else {
  console.log('No base64 found');
}
