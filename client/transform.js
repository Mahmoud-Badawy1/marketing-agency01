import fs from 'fs';

const path = 'd:/projects/marketing/marketing/client/src/components/admin/tabs/SettingsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
  'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";\nimport { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";'
);

// 2. Add Accordion wrapper
content = content.replace(
  '<div className="space-y-8 max-w-5xl mx-auto pb-24">',
  '<div className="max-w-5xl mx-auto pb-24">\n      <Accordion type="multiple" className="w-full space-y-6">'
);

let lastIndex = content.lastIndexOf('</div>\n  );\n}');
if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + '</Accordion>\n    </div>\n  );\n}'
}


// Replace individual Card implementations
const regex = /{([^}]+)}\n\s*<Card>\n\s*<CardHeader([^>]*)>([\s\S]*?)<\/CardHeader>\n\s*<CardContent([^>]*)>([\s\S]*?)<\/CardContent>\n\s*<\/Card>/g;

content = content.replace(regex, (match, comment, headerProps, headerContent, contentProps, cardContent) => {
    let modifiedHeaderContent = headerContent.replace(/onClick=\{\(\) => \(/g, 'onClick={(e) => { e.stopPropagation(); return (');
    modifiedHeaderContent = modifiedHeaderContent.replace(/onClick=\{e => \(/g, 'onClick={(e) => { e.stopPropagation(); return (');
    modifiedHeaderContent = modifiedHeaderContent.replace(/<Button(?!.*onClick)/g, '<Button onClick={(e) => e.stopPropagation()}');
    modifiedHeaderContent = modifiedHeaderContent.replace(/<input type="checkbox"/g, '<input type="checkbox" onClick={(e) => e.stopPropagation()} ');
    
    modifiedHeaderContent = modifiedHeaderContent.replace(/return \(\((.*?)\)\)/g, 'return ($1)');
    modifiedHeaderContent = modifiedHeaderContent.replace(/onClick=\{\(e\) => \{ e\.stopPropagation\(\); return \((.*?)\) \}\}/g, 'onClick={(e) => { e.stopPropagation(); $1; }}');

    let itemValue = comment.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);

    return `{${comment}}\n      <AccordionItem value="item-${itemValue}" className="bg-card border shadow-sm rounded-lg overflow-hidden">\n        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">\n          <div className="flex-1 text-start">\n            <CardHeader className="p-0 flex flex-row items-center justify-between"${headerProps}>\n${modifiedHeaderContent}\n            </CardHeader>\n          </div>\n        </AccordionTrigger>\n        <AccordionContent>\n          <CardContent${contentProps}>\n${cardContent}\n          </CardContent>\n        </AccordionContent>\n      </AccordionItem>`;
});

content = content.replace(/<Card>\n\s*<CardHeader([^>]*)>([\s\S]*?)<\/CardHeader>\n\s*<CardContent([^>]*)>([\s\S]*?)<\/CardContent>\n\s*<\/Card>/g, (match, headerProps, headerContent, contentProps, cardContent) => {
    let modifiedHeaderContent = headerContent.replace(/onClick=\{\(\) => \(/g, 'onClick={(e) => { e.stopPropagation(); return (');
    modifiedHeaderContent = modifiedHeaderContent.replace(/onClick=\{e => \(/g, 'onClick={(e) => { e.stopPropagation(); return (');
    modifiedHeaderContent = modifiedHeaderContent.replace(/<Button(?!.*onClick)/g, '<Button onClick={(e) => e.stopPropagation()}');
    modifiedHeaderContent = modifiedHeaderContent.replace(/<input type="checkbox"/g, '<input type="checkbox" onClick={(e) => e.stopPropagation()} ');
    
    modifiedHeaderContent = modifiedHeaderContent.replace(/return \(\((.*?)\)\)/g, 'return ($1)');
    modifiedHeaderContent = modifiedHeaderContent.replace(/onClick=\{\(e\) => \{ e\.stopPropagation\(\); return \((.*?)\) \}\}/g, 'onClick={(e) => { e.stopPropagation(); $1; }}');

    let itemValue = Math.floor(Math.random() * 1000000).toString();
    
    return `<AccordionItem value="item-${itemValue}" className="bg-card border shadow-sm rounded-lg overflow-hidden">\n        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">\n          <div className="flex-1 text-start">\n            <CardHeader className="p-0 flex flex-row items-center justify-between"${headerProps}>\n${modifiedHeaderContent}\n            </CardHeader>\n          </div>\n        </AccordionTrigger>\n        <AccordionContent>\n          <CardContent${contentProps}>\n${cardContent}\n          </CardContent>\n        </AccordionContent>\n      </AccordionItem>`;
});

fs.writeFileSync(path, content);
console.log("Transformation complete.");
