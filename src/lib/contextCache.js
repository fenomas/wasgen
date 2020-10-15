

/*
 * 
 *      a per-AudioContext cache object for each module to store things
 * 
*/

var caches = new Map()

export function getCache(ctx) {
    if (!caches.has(ctx)) {
        caches.set(ctx, {})
    }
    return caches.get(ctx)
}

// not needed, since per-context settings need to persist even if Gen is disposed
// export function clearCache(ctx) {
//     caches.delete(ctx)
// }

