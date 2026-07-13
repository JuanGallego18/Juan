const BASE = '/api';

async function request(method, url, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + url, opts);
  if (!res.ok) throw new Error(`API ${method} ${url} → ${res.status}`);
  return res.json();
}

export const api = {
  list: (resource) => request('GET', `/${resource}`),
  create: (resource, data) => request('POST', `/${resource}`, data),
  update: (resource, id, data) => request('PUT', `/${resource}/${id}`, data),
  remove: (resource, id) => request('DELETE', `/${resource}/${id}`),
};
