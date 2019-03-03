

const get = Symbol('get')
const post = Symbol('post')

module.exports = class Router {
  constructor(){
    this[get] = []
    this[post] = []

    this.httpRequest = function (req, res) {
      this.route(req,res)
    }.bind(this)
  }

  async route(request, response){
    const { url, method } = request
    let arr
    switch (method) {
      case 'GET':
        arr = this[get].filter(item => (item.url === url || !item.url))
        break;
      case 'POST':
        arr = this[post].filter(item => (item.url === url || !item.url))
        break;
      default:

    }

    for (let {fn} of arr) {
      if (request.finished) {
        return
      }
      let calledFn = fn(request, response)
      if (calledFn instanceof Promise) {
        await calledFn.catch(err => console.error(err))

      }
    }
  }

  post(url, fn){
    if (url instanceof Function) {
      fn = url
      url = ''
    }
    this[post].push({
      url,
      fn
    })
  }

  get(url, fn){
    if (url instanceof Function) {
      fn = url
      url = ''
    }
    this[get].push({
      url,
      fn
    })
  }
}
