import { OnRequestPlugin } from '../../lib/lifecycles/onRequest'

export const getSWScriptTags = (options: OnRequestPlugin<unknown>['options']) =>
`<script type="module-shim">
const launch = async () => import("${options.publicPaths.assets}pages/${options.page.name}.js")

const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register('/assets/simple/@vtex/micro/components/sw/index.js', {
      scope: '/'
    })
    await navigator.serviceWorker.ready
    console.log('🦄 Service worker is ready')
    await launch()
  } catch (error) {
    console.error('💣 Service worker registration failed', error)
  }
}

registerServiceWorker()
</script>
`
