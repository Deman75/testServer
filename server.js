const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

var multiparty = require('multiparty');
var util = require('util');

const mainPath = './public';
var upload_dir = path.join(__dirname, '/public/images/');

function statFile(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, info) => {
      if (error || !info.isFile()) {
        reject(error ? error : 'not a file')
      } else {
        resolve(info)
      }
    })
  })
}

function pushToJSON(path, obj) {
  return new Promise((resolve, reject) => {
    statFile(path)
    .then(() => {
      fs.readFile(path, (err, content) => {
        if (err) return(err);
        let json = JSON.parse(content);
        json.push(obj);
        console.log(json);
        fs.writeFile(path, JSON.stringify(json), (err) => {
          if (err) reject(err);
          resolve(obj);
        })
      })
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    })
  })
}

// pushToJSON('./public/images/images.json', {url: '1', alt:'asgfdas', hint:'Ура!!!'});

var server = http.createServer((request, response) => {
  console.log('Поступил запрос', request.url, request.method);

  if (request.url === '/upload' && request.method === 'POST') {
    const form = new multiparty.Form();
    let fileInfo ={};

    form.on('field', function(name, value) {
      fileInfo[name] = value;
    });
    // Listen for incoming parts of the form.
    form.on('part', function(part) {
      let name, stream;

      // It's a field, not a file.
      if (part.filename) {
        name = part.filename;
        // Write file in upload dir.
        stream = fs.createWriteStream(path.join(upload_dir, name));
        // Display something when file finished to upload.
        part.on('end', function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("File " + name + " saved to disk.");
            let imageInfo = {
              url: `./images/${name}`,
              alt: (fileInfo.alt && fileInfo.alt !=="") ? fileInfo.alt : name,
              hint: (fileInfo.title && fileInfo.title !=="") ? fileInfo.title : name
            }
            pushToJSON('./public/images/images.json', imageInfo)
              .then((obj) => {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(obj));
              })
              .catch((err) => {
                console.log(err);
                fs.unlink(path.join(upload_dir, name), (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("file delet");
                  }
                })
                response.writeHead(400, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(err));
              })
          }
        });
        // Pipe the part parsing stream to the file writing stream.
        part.pipe(stream);
      }
    });
    // End the request when something goes wrong.
    form.on('error', function(err) {
      console.log(err);
      response.writeHead(400, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    });

    form.parse(request);
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
