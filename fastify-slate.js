#!/usr/bin/env node

// https://github.com/fastify/fastify-swagger/blob/master/dynamic.js

const outputFile = process.argv[2]
const routeFiles = process.argv.slice(3)

if (!outputFile || routeFiles.length === 0) {
  console.log(
    'Usage: fastify-slate <outputFile> <routeFile1> <routeFile2> <...>'
  )
  process.exit(0)
}

require("sucrase/register");

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
fastify.register(require('fastify-route-tree'), {
  render: require('./renderFunction')
})

routeModules.forEach(m => fastify.register(m))

fastify.ready(async () => {
  console.log('Doing the thing...')

  const content = (await fastify.routeTree).render()
  console.info(content)

  fs.writeFileSync(outputFile, content)
  process.exit(0)
})
