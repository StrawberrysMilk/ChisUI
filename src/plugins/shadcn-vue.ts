import type { App, Component } from 'vue'

const components = import.meta.glob('../components/ui/**/*.vue', {
  eager: true,
  import: 'default',
}) as Record<string, Component>

const ShadcnVue = {
  install(app: App) {
    for (const [path, component] of Object.entries(components)) {
      const fileName = path.split('/').pop()
      const name = fileName?.replace(/\.vue$/, '')
      if (name && component) app.component(name, component)
    }
  },
}

export default ShadcnVue
