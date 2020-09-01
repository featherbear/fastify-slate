#!/usr/bin/env node

// https://github.com/fastify/fastify-swagger/blob/master/dynamic.js

const outputFile = process.argv[2]
const routeFiles = process.argv.slice(3)

if (!outputFile || routeFiles.length === 0) {
  console.log('Usage: fastify-slate <outputFile> <routeFile1> <routeFile2> <...>')
  process.exit(0)
}

require = require('esm')(module)

const path = require('path')
const fs = require('fs')
const routeModules = []
routeFiles.forEach(p => {
  try {
    routeModules.push(require(path.join(process.cwd(), p)))
  } catch (e) {
    console.error(`Could not load path from [${p}]: ${e}`)
  }
})

if (routeModules.length === 0) {
  console.log('No routes files were valid')
  process.exit(1)
}

const fastify = require('fastify')()

const routes = {}

fastify.addHook('onRoute', function (route) {
  if (route.schema && route.schema.hide) return
  if (route.url in routes) {
    console.warn(`Route [${route.url}] was declared more than once`)
  }
  const routeData = {}
  const methods = typeof route.method === 'string' ? [route.method] : route.method
  methods.forEach(method => (routeData[method] = route.schema))
  routes[route.url
    .replace(/\/+/g, '/')
    .replace(/(.)\/$/, '$1')
  ] = routeData

  // console.log(route.url, methods, route)
})

// fastify.addHook('onRegister', async (instance) => {})

routeModules.forEach(fastify.register)

const { default: PathTree } = require('./tree')
const tree = new PathTree()

fastify.listen(0, () =>
  fastify.close(() => {
    console.log('doing the thing')

    Object.entries(routes).forEach(pair => tree.register(...pair))

    const content = tree.render()
    console.info(content)
    fs.writeFileSync(outputFile, content)
    process.exit(0)
  })
)
