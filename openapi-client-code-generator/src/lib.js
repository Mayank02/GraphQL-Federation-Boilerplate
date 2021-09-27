export async function sleep(ms) {
  let id = 0;
  return new Promise((resolve, reject) => {
    if (Number.parseInt(ms) <= 0) reject('sleep time is invalid: ' + ms);
    id = setTimeout(() => { if (id) clearTimeout(id); id = 0; resolve(true); }, ms);
  });
}

export function memoryCache() {
  let data = {};
  return {
    getItem:    async (k)    => { return Promise.resolve(data[k]); },
    setItem:    async (k, v) => { data[k] = v; return Promise.resolve(true); },
    removeItem: async (k)    => { delete data[k]; return Promise.resolve(true); },
    clear:      async ()     => { data = {}; return Promise.resolve(true); },
  }
}

export async function cacheGetItems(cache, keys) {
  const data = {};
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = await cache.getItem(k);
    if (v) data[k] = v;
  }
  return data;
}
