import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Tooltip,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* FIX DEFAULT ICON */
delete L.Icon.Default.prototype._getIconUrl;

/* ICONS (KEEP FOR SEARCH + USER ONLY) */
const searchIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [40, 40],
});

const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [40, 40],
});

/* 🔥 CUSTOM ICON (BLINK + PRIORITY) */
const createIcon = (color, isBlink = false, isPriority = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="
        marker ${color}
        ${isBlink ? "blink" : ""}
        ${isPriority ? "priority" : ""}
      "></div>
    `,
    iconSize: [30, 30],
  });
};

/* FLY */
function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) map.flyTo(location, 13);
  }, [location]);

  return null;
}

/* HEATMAP */
function Heatmap({ items }) {
  const map = useMap();

  useEffect(() => {
    const points = items
      .filter(i => i.latitude && i.longitude)
      .map(i => [
        parseFloat(i.latitude),
        parseFloat(i.longitude),
        0.5
      ]);

    if (points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
    }).addTo(map);

    return () => map.removeLayer(heatLayer);
  }, [items, map]);

  return null;
}

/* DISTANCE */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(2);
}

function ItemMap() {

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(10); // km
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  /* LOAD ITEMS */
  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:4000/api/items/list")
      .then(res => {
        setItems(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  /* USER LOCATION */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([
        pos.coords.latitude,
        pos.coords.longitude
      ]);
    });
  }, []);

  /* SEARCH */
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
      );

      if (res.data.length > 0) {
        setSearchLocation([
          parseFloat(res.data[0].lat),
          parseFloat(res.data[0].lon)
        ]);
      } else {
        alert("Location not found");
      }
    } catch {
      alert("Search error");
    }
  };

  /* Filter items by distance from search location */
  const filteredItems = items.filter(item => {
    if (!item.latitude || !item.longitude) return false;
    if (!searchLocation) return true;
    const distance = getDistance(
      searchLocation[0],
      searchLocation[1],
      parseFloat(item.latitude),
      parseFloat(item.longitude)
    );
    return distance <= distanceFilter;
  });

  return (
    <div className="map-page">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .map-page {
            min-height: 100vh;
            padding: 2rem;
          }

          /* Main container */
          .map-container-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            border-radius: 2rem;
            padding: 1.5rem;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          /* Header */
          .map-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          }

          .map-header h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          /* Controls bar */
          .controls-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
            align-items: flex-end;
          }

          .search-group {
            flex: 2;
            min-width: 200px;
          }

          .search-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 0.25rem;
          }

          .search-input {
            display: flex;
            gap: 0.5rem;
          }

          .search-input input {
            flex: 1;
            padding: 0.7rem 1rem;
            border-radius: 40px;
            border: none;
            background: rgba(255,255,255,0.9);
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s;
          }

          .search-input input:focus {
            background: white;
            box-shadow: 0 0 0 3px rgba(255,255,255,0.4);
          }

          .search-input button {
            background: white;
            border: none;
            border-radius: 40px;
            padding: 0.7rem 1.2rem;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.1s;
          }

          .search-input button:hover {
            background: #f0f0f0;
            transform: scale(0.97);
          }

          .filter-group {
            flex: 1;
            min-width: 180px;
          }

          .filter-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: rgba(255,255,255,0.8);
            margin-bottom: 0.25rem;
          }

          .filter-group select {
            width: 100%;
            padding: 0.7rem 1rem;
            border-radius: 40px;
            border: none;
            background: rgba(255,255,255,0.9);
            font-size: 0.9rem;
            cursor: pointer;
          }

          .heatmap-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.2);
            padding: 0.3rem 1rem;
            border-radius: 40px;
            color: white;
            font-size: 0.85rem;
          }

          .heatmap-toggle input {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          /* Map container */
          .leaflet-container {
            height: 520px;
            border-radius: 1.5rem;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            margin-bottom: 1.5rem;
            z-index: 1;
          }

          /* Items sidebar */
          .items-sidebar {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 1.5rem;
            padding: 1rem;
            max-height: 300px;
            overflow-y: auto;
            backdrop-filter: blur(4px);
          }

          .items-sidebar h3 {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .item-list {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
          }

          .item-card-small {
            background: white;
            border-radius: 1rem;
            padding: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .item-card-small:hover {
            background: #f1f5f9;
            transform: translateX(4px);
            border-color: #cbd5e1;
          }

          .item-info {
            flex: 1;
          }

          .item-title-small {
            font-weight: 700;
            font-size: 0.9rem;
            color: #1e293b;
          }

          .item-location-small {
            font-size: 0.7rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .status-badge-small {
            font-size: 0.65rem;
            padding: 0.2rem 0.6rem;
            border-radius: 20px;
            font-weight: 600;
          }

          .status-lost {
            background: #fee2e2;
            color: #b91c1c;
          }

          .status-found {
            background: #dcfce7;
            color: #15803d;
          }

          .priority-badge {
            background: #fef3c7;
            color: #b45309;
            font-size: 0.6rem;
            padding: 0.2rem 0.5rem;
            border-radius: 20px;
            margin-left: 0.5rem;
          }

          /* Marker styles */
          .marker {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 3px solid white;
          }

          .red { background: #ff3b3b; }
          .green { background: #2ecc71; }

          .blink {
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }

          .priority {
            box-shadow: 0 0 15px 5px rgba(255, 255, 0, 0.8);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .map-page {
              padding: 1rem;
            }
            .map-container-wrapper {
              padding: 1rem;
            }
            .map-header h2 {
              font-size: 1.3rem;
            }
            .controls-bar {
              flex-direction: column;
            }
            .leaflet-container {
              height: 400px;
            }
          }
        `}
      </style>

      <div className="map-container-wrapper">
        <div className="map-header">
          <h2>
            <span>📍</span> Smart Lost & Found Map
          </h2>
          <div className="heatmap-toggle">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              id="heatmapToggle"
            />
            <label htmlFor="heatmapToggle">🌡️ Show Heatmap</label>
          </div>
        </div>

        <div className="controls-bar">
          <div className="search-group">
            <label>🔍 Search Area</label>
            <div className="search-input">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="City, address, or landmark..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Go</button>
            </div>
          </div>

          <div className="filter-group">
            <label>📏 Distance Filter (km)</label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(Number(e.target.value))}
              disabled={!searchLocation}
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Any distance</option>
            </select>
          </div>

          {searchLocation && (
            <div className="filter-group">
              <button
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  padding: "0.7rem 1.2rem",
                  borderRadius: "40px",
                  color: "white",
                  cursor: "pointer",
                  marginTop: "1.4rem"
                }}
                onClick={() => {
                  setSearchLocation(null);
                  setSearch("");
                }}
              >
                ✕ Clear Search
              </button>
            </div>
          )}
        </div>

        <MapContainer
          center={[28.6, 77.2]}
          zoom={5}
          style={{ height: "520px", borderRadius: "12px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <FlyToLocation location={searchLocation} />
          {showHeatmap && <Heatmap items={items} />}

          {/* SEARCH MARKER */}
          {searchLocation && (
            <>
              <Marker position={searchLocation} icon={searchIcon}>
                <Popup>📍 Search Center</Popup>
              </Marker>
              <Circle
                center={searchLocation}
                radius={distanceFilter * 1000}
                pathOptions={{ color: "blue", weight: 2, fillOpacity: 0.1 }}
              />
            </>
          )}

          {/* USER */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>🟡 You are here</Popup>
            </Marker>
          )}

          {/* ITEMS */}
          {filteredItems.map(item => {
            if (!item.latitude || !item.longitude) return null;

            const lat = parseFloat(item.latitude);
            const lon = parseFloat(item.longitude);
            const isPriority = new Date() - new Date(item.created_at) < 86400000;
            const icon = createIcon(
              item.status === "lost" ? "red" : "green",
              item.status === "lost",
              isPriority
            );

            let distance = null;
            if (searchLocation) {
              distance = getDistance(searchLocation[0], searchLocation[1], lat, lon);
            }

            return (
              <Marker
                key={item.id}
                position={[lat, lon]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedItem(item)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  {item.status === "lost" ? "🔴 LOST" : "🟢 FOUND"} – {item.title}
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    <strong>{item.title}</strong><br />
                    📍 {item.location_text}<br />
                    {isPriority && <span style={{ color: "#e67e22", fontWeight: "bold" }}>⭐ High Priority (last 24h)</span>}<br />
                    {distance && <span>📏 {distance} km from search</span>}<br />
                    {item.image && (
                      <img src={item.image} alt="item" style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px", marginTop: "8px" }} />
                    )}
                    <hr style={{ margin: "8px 0" }} />
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#4f46e5", color: "white", padding: "4px 12px", borderRadius: "20px", textDecoration: "none", fontSize: "0.8rem" }}>
                      🚗 Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Items sidebar */}
        <div className="items-sidebar">
          <h3>
            📋 Recent Items
            <span style={{ fontSize: "0.7rem", background: "#e2e8f0", padding: "2px 8px", borderRadius: "20px" }}>
              {filteredItems.length} shown
            </span>
          </h3>
          <div className="item-list">
            {filteredItems.length === 0 && (
              <div style={{ textAlign: "center", color: "#64748b", padding: "1rem" }}>
                No items in this area
              </div>
            )}
            {filteredItems.slice(0, 15).map(item => {
              const isPriority = new Date() - new Date(item.created_at) < 86400000;
              return (
                <div
                  key={item.id}
                  className="item-card-small"
                  onClick={() => {
                    if (item.latitude && item.longitude) {
                      const map = document.querySelector(".leaflet-container")?._leaflet_map;
                      if (map) map.flyTo([parseFloat(item.latitude), parseFloat(item.longitude)], 15);
                    }
                  }}
                >
                  <div className="item-info">
                    <div className="item-title-small">
                      {item.title}
                      {isPriority && <span className="priority-badge">⭐ New</span>}
                    </div>
                    <div className="item-location-small">
                      📍 {item.location_text?.substring(0, 40) || "Unknown"}
                    </div>
                  </div>
                  <div className={`status-badge-small ${item.status === "lost" ? "status-lost" : "status-found"}`}>
                    {item.status === "lost" ? "Lost" : "Found"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemMap;