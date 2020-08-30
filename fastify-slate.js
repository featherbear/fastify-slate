// https://github.com/fastify/fastify-swagger/blob/master/dynamic.js

const outputFile = process.argv[2]
const routeFiles = process.argv.slice(3)

if (!outputFile || routeFiles.length === 0) {
  console.log('Usage: fastify-slate <outputFile> <routeFile1> <routeFile2> <...>')
  process.exit(0)
}

require = require('esm')(module)

const fs = require('fs')
const routes = []
routeFiles.forEach(path => {
  try {
    routes.push(require(path))
  } catch (e) {
    console.error(`Could not load path from [${path}]: ${e.code}`)
  }
})

if (routes.length === 0) {
  console.log('No routes files were valid')
  process.exit(1)
}

const fastify = require('fastify')()

fastify.addHook('onRoute', function (route) {
  if (route.schema && route.schema.hide) return

  const methods =
    typeof route.method === 'string' ? [route.method] : route.method
  console.log(route.url, methods)
})
// fastify.addHook('onRegister', async (instance) => {
//   console.log(instance)
// })

routes.forEach(fastify.register)

fastify.listen(0, () =>
  fastify.close(() => {
    console.log('doing the thing')
    fs.writeFile(outputFile, '# test!')
    process.exit(0)
  })
)
