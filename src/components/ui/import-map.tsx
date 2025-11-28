"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet with Next.js/React
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Country coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  DE: [51.1657, 10.4515], // Germany
  US: [37.0902, -95.7129], // USA
  JP: [36.2048, 138.2529], // Japan
  KR: [35.9078, 127.7669], // South Korea
  FR: [46.2276, 2.2137], // France
  IT: [41.8719, 12.5674], // Italy
  GB: [55.3781, -3.4360], // United Kingdom
  ES: [40.4637, -3.7492], // Spain
  SE: [60.1282, 18.6435], // Sweden
  BE: [50.5039, 4.4699], // Belgium
  NL: [52.1326, 5.2913], // Netherlands
  CH: [46.8182, 8.2275], // Switzerland
  AT: [47.5162, 14.5501], // Austria
  PL: [51.9194, 19.1451], // Poland
  CZ: [49.8175, 15.4730], // Czech Republic
};

// Component to update map view when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 5);
  }, [center, map]);
  return null;
}

interface ImportMapProps {
  countryCode: string;
}

export default function ImportMap({ countryCode }: ImportMapProps) {
  // Default to Europe center if country not found, or handle gracefully
  const coordinates = countryCoordinates[countryCode] || [48.8566, 2.3522]; // Default to Paris/Central Europeish
  const isKnownCountry = !!countryCoordinates[countryCode];

  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
      <MapContainer
        center={coordinates}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isKnownCountry && (
          <>
            <Marker position={coordinates} icon={customIcon}>
              <Popup>
                Imported from {countryCode}
              </Popup>
            </Marker>
            <ChangeView center={coordinates} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
