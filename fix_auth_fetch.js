const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Remove localStorage.getItem calls
            content = content.replace(/const\s+token\s*=\s*localStorage\.getItem\(['"`]accessToken['"`]\);?\s*/g, '');
            content = content.replace(/let\s+token\s*=\s*localStorage\.getItem\(['"`]accessToken['"`]\);?\s*/g, '');
            // Some use getCookie
            content = content.replace(/const\s+token\s*=\s*getCookie\(['"`]accessToken['"`]\);?\s*/g, '');
            content = content.replace(/function getCookie\([\s\S]*?\}\s*/g, '');

            // Replace headers with credentials
            content = content.replace(/headers:\s*\{\s*Authorization:\s*token\s*\?\s*`Bearer \$\{token\}`\s*:\s*['"`]['"`]\s*\},?/g, "credentials: 'include',");
            content = content.replace(/headers:\s*token\s*\?\s*\{\s*['"`]?Authorization['"`]?:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\},?/g, "credentials: 'include',");
            
            // Sometimes headers exist alongside other options, e.g. method: 'POST', headers: ...
            // We need to be careful with blindly replacing headers if it contains Content-Type
            // Let's replace specifically the Authorization part if Content-Type is present
            // e.g. "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : ''
            content = content.replace(/Authorization:\s*token\s*\?\s*`Bearer \$\{token\}`\s*:\s*['"`]['"`]/g, "/* Authorization removed for cookie */");

            // Also replace cases where we pass `{ headers }`
            content = content.replace(/const\s+headers.*?Authorization.*?;/gs, '');
            
            // For those that just do fetch(..., { headers })
            // this is harder with regex. Let's add credentials to any fetch that has API_URL
            content = content.replace(/fetch\(\s*(`\$\{API_URL\}?[^`]*`[^,]*),\s*\{([^}]*)\}\s*\)/g, (match, url, opts) => {
                if (opts.includes('credentials') || opts.includes('Headers') || opts.includes('cookieStore')) {
                    return match;
                }
                
                // if it uses the empty headers variable
                if (opts.trim() === 'headers' && !content.includes('const headers =')) {
                     return `fetch(${url}, { credentials: 'include' })`;
                }

                if (opts.includes('headers:')) {
                     // Add credentials alongside
                     return `fetch(${url}, {${opts}, credentials: 'include' })`;
                }
                return `fetch(${url}, {${opts}, credentials: 'include' })`;
            });
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed:', fullPath);
            }
        }
    });
}

processDir('./apps/web/app');
processDir('./apps/web/components');
processDir('./packages/mcp-legal-server'); // just in case
