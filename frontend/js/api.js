export const API_URL = 'http://localhost:8000/api';

export function getFetchOptions(method) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    return {
        method: method,
        headers: headers
    };
}
