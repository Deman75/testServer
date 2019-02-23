const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

var multiparty = require('multiparty');
var util = require('util');

const mainPath = './public';

function statFile(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, info) => {
      if (error || !info.isFile()) {
        reject(error ? error : 'not file')
      } else {
        resolve(info)
      }
    })
  })
}

var server = http.createServer((request, response) => {
  console.log('Поступил запрос', request.url, request.method);

  if (request.url === '/upload' && request.method === 'POST') {
    var formData = [];
    request.on('data', chunk => {
      formData.push(chunk)
    });
    request.on('end', () => {
      var form = new multiparty.Form();

      form.parse(request, function(err, fields, files) {

        // fs.writeFileSinc('1.jpg', files[0]);
        console.log(request.data);
        response.writeHead(200, {'content-type': 'text/plain'});
        response.write('received upload:\n\n');
        response.end(util.inspect({fields: fields, files: files}));
      });
      // console.log(Buffer.concat(formData));
      // response.end("file is uploaded");
    });

  } else {
    const url = request.url === '/' ? `${mainPath}/index.html` : `${mainPath + request.url}`;
    statFile(url)
    .then((info) => {
      return {
        "size": info.size,
        "code": "200",
        "path": `${url}`
      }
    })
    .catch((error) => ({ code: 404, path: `${mainPath}/404.html`, size: 400, error: error}))
    .then((info) => {
      if (info.path.indexOf('..') > -1) {
        info.path = `${mainPath}/404.html`;
        info.code = 404;
      }

      var extname = path.extname(info.path);
      var contentType;

      contentType = mime.contentType(extname);

      response.writeHead(info.code, {'Content-Type': contentType, 'Content-Length': info.size});

      let fileStream = fs.createReadStream(info.path)

      fileStream.on('error', (e) => {
        response.end(e.message)
      })
      fileStream.on('end', () => {
        response.end()
      })
      fileStream.pipe(response)
    })
  }
})

server.listen(8888);
