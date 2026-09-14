import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach Bearer token from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear token and redirect to /login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getShipments       = ()   => api.get('/shipments').then(r => r.data)
export const getShipment        = (id) => api.get(`/shipments/${id}`).then(r => r.data)
export const getDisruptions     = ()   => api.get('/disruptions').then(r => r.data)
export const getAffected        = (id) => api.get(`/disruptions/${id}/affected`).then(r => r.data)
export const getFleet           = ()   => api.get('/fleet').then(r => r.data)
export const getIdleFleet       = ()   => api.get('/fleet/idle').then(r => r.data)
export const getColdChainAlerts = ()   => api.get('/cold-chain/alerts').then(r => r.data)
