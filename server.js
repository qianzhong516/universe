const http = require('http');
const fs = require('fs');
const path = require('path');

const requestListener = function(req, res) {
    let filePath = '.' + req.url;
    
    if(filePath === './') {
        filePath = './index.html';
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    let contentType = mimeTypes[extname] || 'application/octet-stream';

    // serve static files
    if(fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    }else {
        console.log(filePath + ' does not exist.');
    }
}

http.createServer(requestListener).listen(8080, () => {
    console.log('Server is host on http://localhost:8080');
});