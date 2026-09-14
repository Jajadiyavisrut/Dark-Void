import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getShipments      = ()   => api.get('/shipments').then(r => r.data)
export const getShipment       = (id) => api.get(`/shipments/${id}`).then(r => r.data)
export const getDisruptions    = ()   => api.get('/disruptions').then(r => r.data)
export const getAffected       = (id) => api.get(`/disruptions/${id}/affected`).then(r => r.data)
export const getFleet          = ()   => api.get('/fleet').then(r => r.data)
export const getIdleFleet      = ()   => api.get('/fleet/idle').then(r => r.data)
export const getColdChainAlerts= ()   => api.get('/cold-chain/alerts').then(r => r.data)
