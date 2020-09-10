const TreeSymbol = Symbol('tree')
const MethodSymbol = Symbol('method')
const BaseSymbol = Symbol('base')
const ParentTreeSymbol = Symbol('parent')

class Tree {
  constructor (base = '/', parent = null) {
    this[BaseSymbol] = base
    this[TreeSymbol] = {}
    this[ParentTreeSymbol] = parent
  }

  register (path, methods) {
    const newPath = path.split('/').filter(p => p.length)
    const base = newPath.shift()
    if (typeof base === 'undefined') {
      this[TreeSymbol][MethodSymbol] = methods
      return
    }

    if (!(base in this[TreeSymbol])) {
      this[TreeSymbol][base] = new Tree(base, this)
    }
    this[TreeSymbol][base].register(newPath.join('/'), methods)
  }

  render (level = 1) {
    const stringBuilder = []

    if (this[TreeSymbol][MethodSymbol]) {
      for (const method in this[TreeSymbol][MethodSymbol]) {
        stringBuilder.push(`\`${method} ${this.path || '/'}\``)
        if (
          this[TreeSymbol][MethodSymbol][method] &&
          this[TreeSymbol][MethodSymbol][method].description
        ) {
          stringBuilder.push(this[TreeSymbol][MethodSymbol][method].description)

          if (typeof this[TreeSymbol][MethodSymbol][method].preValidation !== 'undefined') {
            const conditionBuilder = ['**Requirements**\n']
            for (const validationFn of this[TreeSymbol][MethodSymbol][method].preValidation) {
              if (validationFn && validationFn.comment) {
                conditionBuilder.push('- ' + validationFn.comment)
              }
            }
            stringBuilder.push(conditionBuilder.join('\n'))
          }

          const tableBuilder = (targetSchema) => {
            let schema = this[TreeSymbol][MethodSymbol][method][targetSchema]

            if (typeof schema !== 'undefined') {
              if (schema.type && schema.properties) {
                schema = schema.properties
              }
              const tableBuilder = ['|Parameter|Type|Description|\n|:---|:---|:---|']
              for (const [name, data] of Object.entries(schema)) {
                tableBuilder.push(`|**${name}**|\`${data.type || ''}\`|${data.description || ''}`)
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
      if ((!path.startsWith(':')) || Object.keys(tree[TreeSymbol]).length) {
        content += `${'#'.repeat(level)} ${path}\n\n`
      }

      content += `${tree.render(level + 1)}`
      stringBuilder.push(content)
    }

    return stringBuilder.join('\n\n')
  }

  get path () {
    if (!this[ParentTreeSymbol]) return ''
    return [this[ParentTreeSymbol].path, this[BaseSymbol]].join('/')
  }
}

export default Tree
