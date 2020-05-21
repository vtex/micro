self.addEventListener('install', (event: any) => {
  // (self as any).skipWaiting()
})

self.addEventListener('activate', (event: any) => {
  // @ts-ignore: clients is defined in service worker context
  // eslint-disable-next-line no-undef
  event.waitUntil(clients.claim())

  console.log('activate')
})

const maybeAddJSExtensionToUrl = (url: string) => {
  const fileName = url.split('/').pop() || ''
  const ext = fileName.includes('.') ? url.split('.').pop() : ''
  return !ext && !url.endsWith('/') ? url + '.js' : url
}

self.addEventListener('fetch', (event: any) => event.respondWith(fetchEvent(event)))

const fetchEvent = async (event: any): Promise<Response> => {
  const { request: { url: rawUrl, init } } = event
  const url = maybeAddJSExtensionToUrl(rawUrl)

  console.log(url)

  const res = await fetch(url, init)
  const body = await res.text()

  if (url.endsWith('.js')) {
    return new Response(body, res)
  }

  if (url.endsWith('.css')) {
    return new Response(// TODO We don't track instances, so 2x import will result in 2x <style> tags
    `
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      style.appendChild(document.createTextNode(
        ${JSON.stringify(body)}
      ));
      head.appendChild(style);
      export default null;
    `,
    {
      headers: new Headers({
        'Content-Type': 'application/javascript'
      })
    })
  }

  console.log('xablau', url)
  throw new Error('adlhasdhas')
}
