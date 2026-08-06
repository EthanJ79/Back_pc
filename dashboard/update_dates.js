const fs = require('fs');
let content = fs.readFileSync('dashboard/app.js', 'utf8');

// Replace toLocaleString
content = content.replace(/\.toLocaleString\(\s*getLocale\(currentLang\)\s*\)/g, ".toLocaleString(getLocale(currentLang), { timeZone: currentTz })");
content = content.replace(/\.toLocaleString\(\s*locale\s*\)/g, ".toLocaleString(locale, { timeZone: currentTz })");

// Replace toLocaleDateString
content = content.replace(/\.toLocaleDateString\(\s*getLocale\(currentLang\)\s*\)/g, ".toLocaleDateString(getLocale(currentLang), { timeZone: currentTz })");
content = content.replace(/\.toLocaleDateString\(\s*locale\s*,\s*\{/g, ".toLocaleDateString(locale, { timeZone: currentTz,");

// Update first_seen formatting
const firstSeenOld = `                const dateObj = new Date(emp.first_seen);
                // 시간 추출 HH:MM:SS
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                firstSeenText = \`\${hours}:\${minutes}:\${seconds}\`;`;

const firstSeenNew = `                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: currentTz,
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
                firstSeenText = formatter.format(new Date(emp.first_seen));`;

content = content.replace(firstSeenOld, firstSeenNew);

fs.writeFileSync('dashboard/app.js', content);
console.log('Done!');
