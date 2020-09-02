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
        stringBuilder.push(`\`${method}: ${this.path || '/'}\``)
        if (
          this[TreeSymbol][MethodSymbol][method] &&
          this[TreeSymbol][MethodSymbol][method].description
        ) {
          stringBuilder.push(this[TreeSymbol][MethodSymbol][method].description)
        }
      }
    }

    for (const [path, tree] of Object.entries(this[TreeSymbol])) {
      stringBuilder.push(
        `${'#'.repeat(level)} ${path}\n\n${tree.render(level + 1)}`
      )
    }

    return stringBuilder.join('\n\n')
  }

  get path () {
    if (!this[ParentTreeSymbol]) return ''
    return [this[ParentTreeSymbol].path, this[BaseSymbol]].join('/')
  }
}

export default Tree
