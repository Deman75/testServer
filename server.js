const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

var multiparty = require('multiparty');
var util = require('util');
const db = require('./db');

const Router = require('./router.js');
const router = new Router();

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

const connectDB = async (userName) => {
  // const { rows } = await db.query('SELECT * FROM users WHERE login = $1', [userName])
  const { rows } = await db.query('SELECT * FROM users ORDER BY id DESC');
  for (let i = 0; i < rows.length; i++) {
    console.log(rows[i]);
  }
}

const checkUser = async (login, password) => {
  try {
    const data = await db.query('SELECT * FROM users WHERE login = $1 AND password = $2', [login, password]);
    if (rows.length === 1) {
      return true;
    } else {
      return false;
    }

  } catch (e) {
    throw new Error(e);
  }

  data.find(login => login === 'Dima')
}

const sendQuery = async (query, params) => {
  try {
    const { rows } = await db.query(query, params);
    if (rows.length === 1) {
      return rows[0];
    } else {
      return false;
    }
  } catch (e) {
    throw new Error(e);
  }
}

connectDB('deman75');

http.createSecureServer(router.httpRequest).listen(8080);

// router.get('/login', async (req, res) => {
//   await new Promise((resolve, reject) => {
//
//   })
// })


router.get( async (req, res) => {
  if (req.url.indexOf('..') > -1) return;

  const url = req.url === '/' ? `${mainPath}/index.html` : `${mainPath + req.url}`;

  const stat = await statFile(url)
    .catch((err) => {
      throw new Error('Пустатя статистика')
    })

  let info = {
    "size": stat.size,
    "code": "200",
    "path": `${url}`
  }


  var extname = path.extname(info.path);
  var contentType;

  contentType = mime.contentType(extname);

  res.writeHead(info.code, {'Content-Type': contentType, 'Content-Length': info.size});

  let fileStream = fs.createReadStream(info.path)
    await new Promise((resolve, reject) => {
      fileStream.on('error', (e) => {
        res.end(e.message, reject)
      })
      fileStream.on('end', () => {
        res.end(resolve)
      })
      fileStream.pipe(res)
    })
})

router.get(async (req, res) => {
  console.log('404');
  res.writeHead(404);
  res.end('нет такой страницы');
})

// var server = http.createServer((request, response) => {
//   console.log('Поступил запрос', request.url, request.method);
//
//   if (request.url === '/upload' && request.method === 'POST') {
//     const form = new multiparty.Form();
//     let fileInfo ={};
//
//     form.on('field', function(name, value) {
//       fileInfo[name] = value;
//     });
//     // Listen for incoming parts of the form.
//     form.on('part', function(part) {
//       let name, stream;
//
//       // It's a field, not a file.
//       if (part.filename) {
//         name = part.filename;
//         // Write file in upload dir.
//         stream = fs.createWriteStream(path.join(upload_dir, name));
//         // Display something when file finished to upload.
//         part.on('end', function(err) {
//           if (err) {
//             console.log(err);
//           } else {
//             console.log("File " + name + " saved to disk.");
//             let imageInfo = {
//               url: `./images/${name}`,
//               alt: (fileInfo.alt && fileInfo.alt !=="") ? fileInfo.alt : name,
//               hint: (fileInfo.title && fileInfo.title !=="") ? fileInfo.title : name
//             }
//             pushToJSON('./public/images/images.json', imageInfo)
//               .then((obj) => {
//                 response.writeHead(200, {'Content-Type': 'application/json'});
//                 response.end(JSON.stringify(obj));
//               })
//               .catch((err) => {
//                 console.log(err);
//                 fs.unlink(path.join(upload_dir, name), (err) => {
//                   if (err) {
//                     console.log(err);
//                   } else {
//                     console.log("file delet");
//                   }
//                 })
//                 response.writeHead(400, {'Content-Type': 'application/json'});
//                 response.end(JSON.stringify(err));
//               })
//           }
//         });
//         // Pipe the part parsing stream to the file writing stream.
//         part.pipe(stream);
//       }
//     });
//     // End the request when something goes wrong.
//     form.on('error', function(err) {
//       console.log(err);
//       response.writeHead(400, {'Content-Type': 'application/json'});
//       response.end(JSON.stringify(err));
//     });
//
//     form.parse(request);
//   } else  if (request.url === '/login' && request.method === 'POST') {
//
//     const form = new multiparty.Form();
//     let query = '',
//         params = [],
//         result = new Object();
//
//     form.parse(request, function(err, fields) {
//
//       if (err) {
//         response.writeHead(400, {'content-type': 'application/json'});
//         response.end(JSON.stringify(err));
//         return;
//       }
//
//       const {login, password} = fields;
//       query = 'SELECT * FROM users WHERE login = $1';
//       params = [login[0]];
//
//       sendQuery(query, params)
//         .catch((err) => {
//           response.writeHead(400, {'content-type': 'application/json'});
//           response.end(JSON.stringify(err));
//         })
//         .then(row => {
//           if (row) {
//             result.login = true;
//             query = 'SELECT * FROM users WHERE login = $1 AND password = $2';
//             params = [login[0], password[0]];
//             return sendQuery(query, params);
//           } else {
//               result.login = false;
//               response.writeHead(400, {'content-type': 'application/json'});
//               response.end(JSON.stringify(result));
//           }
//         })
//         .catch((err) => {
//           response.writeHead(400, {'content-type': 'application/json'});
//           response.end(JSON.stringify(err));
//         })
//         .then((row) => {
//           if (row) {
//             result.password = true;
//             response.writeHead(200, {'content-type': 'application/json'});
//             response.end(JSON.stringify(result));
//           } else {
//             result.password = false;
//             response.writeHead(400, {'content-type': 'application/json'});
//             response.end(JSON.stringify(result));
//           }
//         })
//     });
//
//
//   } else  if (request.url === '/register' && request.method === 'POST') {
//
//     const form = new multiparty.Form();
//     let query = '',
//         params = [];
//
//     form.parse(request, function(err, fields) {
//
//       if (err) {
//         response.writeHead(400, {'content-type': 'application/json'});
//         response.end(JSON.stringify(err));
//         return;
//       }
//
//       const {loginReg, emailReg, passReg, passConfirmReg} = fields;
//
//       console.log(loginReg[0], emailReg[0], passReg[0], passConfirmReg[0]);
//
//       query = 'SELECT login, email FROM users WHERE login = $1 OR email = $2 LIMIT 1';
//       params = [loginReg[0], emailReg[0]];
//       sendQuery(query, params)
//         .catch((err) => {
//           response.writeHead(400, {'content-type': 'application/json'});
//           response.end(JSON.stringify(err));
//         })
//         .then(row => {
//           if (!row) {
//             const date = Date.now();
//             query = 'INSERT INTO users (login,email,password,email_confirmed,date) VALUES ( $1, $2, $3, $4, $5 ) RETURNING login';
//             params = [loginReg[0], emailReg[0], passReg[0], false, new Date(date)];
//             return sendQuery(query, params);
//           } else {
//             let result = {};
//             if (row.login === loginReg[0]) result.login = true;
//             if (row.email === emailReg[0]) result.email = true;
//
//             response.writeHead(200, {'content-type': 'application/json'});
//             response.end(JSON.stringify(result));
//           }
//         })
//         .catch((err) => {
//           response.writeHead(400, {'content-type': 'application/json'});
//           response.end(JSON.stringify(err));
//         })
//         .then((row) => {
//           if (row) {
//             let result = {'newUser': row.login};
//             response.writeHead(200, {'content-type': 'application/json'});
//             response.end(JSON.stringify(result));
//           } else {
//             let result = {'newUser': false};
//             response.writeHead(200, {'content-type': 'application/json'});
//             response.end(JSON.stringify(result));
//           }
//         })
//
//     });
//
//
//   } else {
//     const url = request.url === '/' ? `${mainPath}/index.html` : `${mainPath + request.url}`;
//     statFile(url)
//     .then((info) => {
//       return {
//         "size": info.size,
//         "code": "200",
//         "path": `${url}`
//       }
//     })
//     .catch((error) => ({ code: 404, path: `${mainPath}/404.html`, size: 400, error: error}))
//     .then((info) => {
//       if (info.path.indexOf('..') > -1) {
//         info.path = `${mainPath}/404.html`;
//         info.code = 404;
//       }
//
//       var extname = path.extname(info.path);
//       var contentType;
//
//       contentType = mime.contentType(extname);
//
//       response.writeHead(info.code, {'Content-Type': contentType, 'Content-Length': info.size});
//
//       let fileStream = fs.createReadStream(info.path)
//
//       fileStream.on('error', (e) => {
//         response.end(e.message)
//       })
//       fileStream.on('end', () => {
//         response.end()
//       })
//       fileStream.pipe(response)
//     })
//   }
// })

// server.listen(8888);
