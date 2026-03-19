import fs from 'fs';
let c = fs.readFileSync('./src/components/admin/tabs/SettingsTab.tsx', 'utf8');
c = c.replace(/className="p-0 flex flex-row items-center justify-between" className="/g, 'className="p-0 flex flex-row items-center justify-between ');
fs.writeFileSync('./src/components/admin/tabs/SettingsTab.tsx', c);
