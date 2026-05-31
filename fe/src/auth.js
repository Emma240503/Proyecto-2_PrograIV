export function getToken() {
  return localStorage.getItem('token');
}

export function getRol() {
  return localStorage.getItem('rol');
}

export function getId() {
  return localStorage.getItem('id');
}

export function getNombre() {
  return localStorage.getItem('nombre');
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  ['token', 'rol', 'id', 'nombre'].forEach(k => localStorage.removeItem(k));
}

export function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}