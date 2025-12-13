import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMap } from '@coreui/icons'
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import InfoZone from './InfoZone'
import { listZones } from 'src/services/zones'
import { listComplaints } from 'src/services/complaints'
import ZoneSiderbar from './ZoneSiderbar'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const MapUpdater = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom)
    }
  }, [center, zoom, map])
  return null
}

const Zones = () => {
  const position = [7.7669, -72.225]
  const [complaints, setComplaints] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [zones, setZones] = useState([])
  const [mapCenter, setMapCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(12)

  useEffect(() => {
    fetchComplaints()
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      const data = await listZones()
      setZones(data || [])
    } catch (error) {
      console.error('Error fetching zones:', error)
    }
  }

  const fetchComplaints = async () => {
    try {
      const data = await listComplaints()
      setComplaints(data || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
    }
  }

  const handleZoneClick = (zone) => {
    setSelectedZone(zone)
    setShowInfo(true)
  }

  const handleLocateComplaint = (complaint) => {
    if (complaint.lat && complaint.lng) {
      setMapCenter([complaint.lat, complaint.lng])
      setMapZoom(16)
    }
  }

  return (
    <CRow>
      <CCol xs={12} md={8}>
        <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ height: '5px', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>
          <CCardHeader className="border-bottom-0 pt-4 pb-3 px-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h4 className="mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>
                  <CIcon icon={cilMap} className="me-2 text-primary" />
                  Patrol Zones Map
                </h4>
                <p className="text-muted mb-0 small">
                  Geographical distribution of jurisdiction and active reports
                </p>
              </div>
            </div>
          </CCardHeader>

          <CCardBody className="px-4 pb-4">
            <div className="border rounded-3 overflow-hidden shadow-sm">
              <MapContainer center={position} zoom={12} style={{ height: '550px', width: '100%' }}>
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {zones.map((zone, index) => (
                  <Polygon
                    key={zone.id || index}
                    positions={zone.positions}
                    eventHandlers={{
                      click: () => handleZoneClick(zone),
                      mouseover: (e) => {
                        e.target.setStyle({ weight: 4, fillOpacity: 0.8 });
                      },
                      mouseout: (e) => {
                        e.target.setStyle({ weight: 2, fillOpacity: 0.6 });
                      }
                    }}
                    pathOptions={{
                      color: 'white',
                      weight: 2,
                      dashArray: '5, 5',
                      fillColor: zone.color,
                      fillOpacity: 0.6,
                    }}
                  >
                    <Tooltip sticky>
                      <span className="fw-bold">{zone.name}</span>
                    </Tooltip>
                  </Polygon>
                ))}

                {complaints.map((complaint) => (
                  complaint.lat && complaint.lng ? (
                    <Marker
                      key={complaint.id}
                      position={[complaint.lat, complaint.lng]}
                    >
                      <Popup>
                        <strong>{complaint.title}</strong><br />
                        {complaint.location}<br />
                        <span className={`badge bg-${complaint.status === 'Resolved' ? 'success' : 'warning'}`}>
                          {complaint.status}
                        </span>
                      </Popup>
                    </Marker>
                  ) : null
                ))}
              </MapContainer>
            </div>
            <div className="mt-3 small text-muted text-center">
              Click on any zone highlighted above to view detailed statistics and active complaints in that area.
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12} md={4}>
        <ZoneSiderbar onLocate={handleLocateComplaint} />
      </CCol>
      <InfoZone
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        zone={selectedZone}
        complaints={complaints}
      />
    </CRow>
  )
}


export default Zones