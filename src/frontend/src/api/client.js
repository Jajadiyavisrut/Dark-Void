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

// Shipments
export const getShipments            = ()   => api.get('/shipments').then(r => r.data)
export const getShipment             = (id) => api.get(`/shipments/${id}`).then(r => r.data)
export const getShipmentAnalytics    = ()   => api.get('/shipments/analytics').then(r => r.data)
export const applyShipmentReroute    = (id) => api.post(`/shipments/${id}/apply-reroute`).then(r => r.data)

// Disruptions
export const getDisruptions          = ()            => api.get('/disruptions').then(r => r.data)
export const getAffected             = (id)          => api.get(`/disruptions/${id}/affected`).then(r => r.data)
export const approveDisruptionReroute= (id, payload) => api.post(`/disruptions/${id}/approve-reroute`, payload || {}).then(r => r.data)
export const dispatchDisruptionDrivers=(id)          => api.post(`/disruptions/${id}/dispatch-drivers`).then(r => r.data)
export const archiveDisruption       = (id)          => api.post(`/disruptions/${id}/archive`).then(r => r.data)

// Fleet
export const getFleet                = ()            => api.get('/fleet').then(r => r.data)
export const getIdleFleet            = ()            => api.get('/fleet/idle').then(r => r.data)
export const redeployFleet           = (payload)     => api.post('/fleet/redeploy', payload).then(r => r.data)
export const autoDispatchFleet       = ()            => api.post('/fleet/auto-dispatch').then(r => r.data)
export const assignFleetRoute        = (assetId, p)  => api.post(`/fleet/${assetId}/assign`, p).then(r => r.data)
export const getFleetGps             = (assetId)     => api.get(`/fleet/${assetId}/gps`).then(r => r.data)

// Cold Chain
export const getColdChainAlerts      = ()            => api.get('/cold-chain/alerts').then(r => r.data)
export const triggerEmergencyRefrigeration = (shpId) => api.post(`/cold-chain/${shpId}/refrigerate`).then(r => r.data)
export const getColdChainComplianceLogs    = ()      => api.get('/cold-chain/compliance-logs').then(r => r.data)
