const apiUrl = process.env.E2E_API_URL || process.env.API_BASE_URL || 'http://localhost:8080';
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const skipWeather = process.env.SMOKE_SKIP_WEATHER === '1';

const required = (name, value) => {
  if (!value) throw new Error(`Falta ${name}. Configura ${name} para ejecutar smoke API autenticado.`);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
};

const assertStatus = ({ response, body }, expected, label) => {
  if (!expected.includes(response.status)) {
    throw new Error(`${label} falló: HTTP ${response.status}. Respuesta: ${JSON.stringify(body).slice(0, 500)}`);
  }
};

required('E2E_EMAIL', email);
required('E2E_PASSWORD', password);

console.log(`API smoke contra ${apiUrl}`);

const swagger = await request('/swagger/index.html');
assertStatus(swagger, [200, 301, 302], 'swagger disponible');

const login = await request('/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
assertStatus(login, [200], 'login');

const token = login.body?.token;
if (!token) throw new Error('login no retornó token');

const authHeaders = { Authorization: `Bearer ${token}` };

const profile = await request('/user/profile', { method: 'GET', headers: authHeaders });
assertStatus(profile, [200], 'GET /user/profile');
console.log('OK GET /user/profile');

const userId = profile.body?.message?._id;
if (!userId) throw new Error('profile no retornó _id');

const batch = await request(`/user/batch?ids=${userId}`, { method: 'GET', headers: authHeaders });
assertStatus(batch, [200], 'GET /user/batch');
if (!Array.isArray(batch.body?.message) || batch.body.message.length !== 1) {
  throw new Error(`GET /user/batch no retornó el usuario esperado: ${JSON.stringify(batch.body).slice(0, 500)}`);
}
console.log('OK GET /user/batch');

const paginatedRoutes = await request('/route?page=1&limit=1', { method: 'GET', headers: authHeaders });
assertStatus(paginatedRoutes, [200], 'GET /route paginado');
if (!paginatedRoutes.body?.pagination) {
  throw new Error(`GET /route paginado no retornó metadata de paginación: ${JSON.stringify(paginatedRoutes.body).slice(0, 500)}`);
}
console.log('OK GET /route?page=1&limit=1');

const checks = [
  ['GET', '/route', [200]],
  ['GET', '/risk', [200]],
  ['GET', '/helping-point', [200]],
  ['GET', '/notification/unread', [200]],
  ['GET', '/notification/read', [200]],
  ['GET', '/calendar-event', [200]],
];

if (!skipWeather) {
  checks.push(['GET', '/weather?latitude=-29.959&longitude=-71.341', [200]]);
}

for (const [method, path, expected] of checks) {
  const result = await request(path, { method, headers: authHeaders });
  assertStatus(result, expected, `${method} ${path}`);
  console.log(`OK ${method} ${path}`);
}

console.log('API smoke OK');
