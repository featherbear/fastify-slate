const {
  TreeSymbol,
  MethodSymbol,
  BaseSymbol,
  ParentTreeSymbol
} = require('fastify-route-tree')

module.exports = function renderFunction (level = 1) {
  const stringBuilder = []

  if (this[TreeSymbol][MethodSymbol]) {
    for (const method in this[TreeSymbol][MethodSymbol]) {
      stringBuilder.push(`\`${method} ${this.path || '/'}\``)
      if (
        this[TreeSymbol][MethodSymbol][method] &&
        this[TreeSymbol][MethodSymbol][method].description
      ) {
        stringBuilder.push(this[TreeSymbol][MethodSymbol][method].description)

        if (
          typeof this[TreeSymbol][MethodSymbol][method].preValidation !==
          'undefined'
        ) {
          const conditionBuilder = ['**Requirements**\n']
          for (const validationFn of this[TreeSymbol][MethodSymbol][method]
            .preValidation) {
            if (validationFn && validationFn.comment) {
              conditionBuilder.push('- ' + validationFn.comment)
            }
          }
          stringBuilder.push(conditionBuilder.join('\n'))
        }

        const tableBuilder = targetSchema => {
          let schema = this[TreeSymbol][MethodSymbol][method][targetSchema]

          if (typeof schema !== 'undefined') {
            if (schema.type && schema.properties) {
              schema = schema.properties
            }
            const tableBuilder = [
              '|Parameter|Type|Description|\n|:---|:---|:---|'
            ]
            for (const [name, data] of Object.entries(schema)) {
              tableBuilder.push(
                `|**${name}**|\`${data.type || ''}\`|${data.description || ''}`
              )
            }

            stringBuilder.push(tableBuilder.join('\n'))
          }
        }

        tableBuilder('params')
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          tableBuilder('body')
        }
      }
    }
  }

  for (const [path, tree] of Object.entries(this[TreeSymbol])) {
    let content = ''
    if (!path.startsWith(':') || Object.keys(tree[TreeSymbol]).length) {
      content += `${'#'.repeat(level)} ${path}\n\n`
    }

    content += `${tree.render(level + 1)}`
    stringBuilder.push(content)
  }

  return stringBuilder.join('\n\n')
}
