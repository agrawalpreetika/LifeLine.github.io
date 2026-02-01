import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for default Leaflet icon not showing up
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Search Component
function SearchField({ provider, onResult }) {
    const map = useMap();

    useEffect(() => {
        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false, // We will manage the marker ourselves
            keepResult: true,
            autoClose: true,
        });

        map.addControl(searchControl);

        map.on('geosearch/showlocation', (result) => {
            if (onResult) {
                onResult(result.location);
            }
        });

        return () => map.removeControl(searchControl);
    }, [map, provider, onResult]);

    return null;
}

// Draggable Marker Component
function DraggableMarker({ position, setPosition, onDragEnd }) {
    const markerRef = useRef(null);

    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onDragEnd(newPos);
                }
            },
        }),
        [onDragEnd, setPosition]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                <span>Drag me to adjust location!</span>
            </Popup>
        </Marker>
    );
}

// Click to move marker
function MapClickHandler({ setPosition, onLocationUpdate }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationUpdate(e.latlng);
        },
    });
    return null;
}

export default function LocationPickerMap({ onLocationSelect, camps = [], currentUserId }) {
    // Default center (e.g., New York)
    const [position, setPosition] = useState({ lat: 40.7128, lng: -74.0060 });
    const [address, setAddress] = useState('');
    const provider = new OpenStreetMapProvider();

    // Red Icon for My Camps
    const RedIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Blue Icon for Other Camps
    const BlueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Helper to fetch address from coordinates (Reverse Geocoding)
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
                // Send back to parent
                onLocationSelect({
                    lat,
                    lng,
                    address: data.display_name
                });
            } else {
                // Fallback if no address found
                onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
        }
    };

    // Handle Search Result
    const handleSearchResult = (location) => {
        const newPos = { lat: location.y, lng: location.x };
        setPosition(newPos);
        setAddress(location.label);
        // Ensure map view updates is handled by the search control usually, but we update our state
        onLocationSelect({
            lat: newPos.lat,
            lng: newPos.lng,
            address: location.label
        });
    };

    // Handle Drag End
    const handleDragEnd = (newPos) => {
        fetchAddress(newPos.lat, newPos.lng);
    };

    // Handle Map Click
    const handleMapClick = (newPos) => {
        fetchAddress(newPos.lat, newPos.lng);
    };

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden relative z-0">
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SearchField provider={provider} onResult={handleSearchResult} />

                <DraggableMarker
                    position={position}
                    setPosition={setPosition}
                    onDragEnd={handleDragEnd}
                />

                <MapClickHandler
                    setPosition={setPosition}
                    onLocationUpdate={handleMapClick}
                />

                {/* Render Markers for Upcoming Camps */}
                {camps.map(camp => {
                    const isMyCamp = camp.organizerId === currentUserId;
                    return (
                        camp.location && camp.location.lat && camp.location.lng && (
                            <Marker
                                key={camp.id}
                                position={[camp.location.lat, camp.location.lng]}
                                icon={isMyCamp ? RedIcon : BlueIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isMyCamp ? 'text-red-600' : 'text-blue-600'}`}>
                                            {isMyCamp ? 'Your Camp' : 'External Organization'}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">{camp.campName}</h3>
                                        <div className="mt-1 text-xs text-slate-600">
                                            <p className="font-medium">{new Date(camp.date).toDateString()}</p>
                                            <p>{camp.startTime} - {camp.endTime}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    );
                })}
            </MapContainer>

            {/* Overlay Address Display (Optional) */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] text-sm border border-slate-200">
                <p className="font-bold text-slate-700">Selected Location:</p>
                <p className="text-slate-600 truncate">{address || "Search or click on map to select"}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                    {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
            </div>
        </div>
    );
}
