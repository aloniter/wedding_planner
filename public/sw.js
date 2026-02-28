const CACHE_NAME = 'wedding-planner-v1'
const SHARE_CACHE = 'wedding-planner-share'

// Install event - cache assets
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== SHARE_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Handle shared files from Web Share Target API
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('/contacts')) {
    event.respondWith(handleShareTarget(event.request))
  }
})

async function handleShareTarget(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (file) {
      // Store the file in cache for the page to retrieve
      const cache = await caches.open(SHARE_CACHE)
      const fileContent = await file.arrayBuffer()
      const fileName = file.name || 'shared-contacts.vcf'

      // Store file metadata + content
      await cache.put(
        new Request('shared-file:metadata'),
        new Response(
          JSON.stringify({
            name: fileName,
            type: file.type,
            size: fileContent.byteLength,
            timestamp: Date.now(),
          })
        )
      )

      // Store file content as blob
      await cache.put(
        new Request('shared-file:content'),
        new Response(new Blob([fileContent], { type: file.type }))
      )

      // Redirect to /contacts with shared flag
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/contacts?shared=1',
        },
      })
    }

    return new Response('No file received', { status: 400 })
  } catch (error) {
    console.error('Share target error:', error)
    return new Response('Error processing shared file', { status: 500 })
  }
}
