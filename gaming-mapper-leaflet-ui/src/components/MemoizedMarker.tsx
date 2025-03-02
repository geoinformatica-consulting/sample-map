import L from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Tooltip } from "react-leaflet";


// Memoize the Marker component to prevent unnecessary re-renders
const MemoizedMarker = React.memo(({ feature, fetchWikiContent }: any) => {
    const [wikiContent, setWikiContent] = useState<string>("");
    const [position, setPosition] = useState<[number, number]>([
      feature.geometry.coordinates[1],
      feature.geometry.coordinates[0],
    ]);

    // Format date as January 1, 2000
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Format units sold
    const formatNumber = (value: number): string => {
      if (value === -1) return "N/A";
      return value.toLocaleString("en-US");
    };

    const icon = React.useMemo(() => L.icon({
      iconUrl: `${process.env.PUBLIC_URL}${feature.properties.icon_url}` || `${process.env.PUBLIC_URL}icons/console.png`,
      iconSize: [65, 65],
    //   iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }), [feature.properties.icon_url]); // Only recreate icon if URL changes
  
    const popupRef = useRef<any>(null);

    useEffect(() => {
      // Fetch Wikipedia content if it hasn't been fetched yet
      const id = feature.id;
      if (!wikiContent) {
        fetchWikiContent(feature.properties.gaming_system, id).then((content: React.SetStateAction<string>) => {
          setWikiContent(content); // Update state once the content is fetched
        });
      }
    }, [feature, fetchWikiContent, wikiContent]);
  
    const handleDragEnd = (event: any) => {
      const newLatLng = event.target.getLatLng();
      setPosition([newLatLng.lat, newLatLng.lng]);
    };

    // Dynamically adjust popup width based on screen size
    const popupStyle: React.CSSProperties = {
      maxWidth: window.innerWidth < 600 ? "200px" : "300px", // Smaller on small screens
      padding: "10px",
    };

    return (
      <Marker
        key={feature.id}
        position={position}
        draggable={true} 
        eventHandlers={{
          dragend: handleDragEnd, // Updates position on drag
        }}
        icon={icon}
      >
        <Tooltip direction="top" offset={[0, -30]} opacity={25}>
          <span style={{ fontSize: "15px" }}>{feature.properties.gaming_system}</span>
        </Tooltip>
        <Popup
          ref={popupRef}
          closeButton={true}
          closeOnEscapeKey={true}
          closeOnClick={false}
        >
          <div style={popupStyle}>
          <h3 style={{ fontSize: window.innerWidth < 600 ? "14px" : "18px" }}>
            {feature.properties.game_name}
          </h3>
          <p><strong>System:</strong> {feature.properties.gaming_system}</p>
          <img
            src={feature.properties.image_url}
            alt={feature.properties.gaming_system}
            style={{
              width: "100%",
              maxWidth: window.innerWidth < 600 ? "120px" : "200px", // Adjust image size for mobile
              height: "auto",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              marginBottom: "10px",
            }}
          />
          <p><strong>Sample Game:</strong> {feature.properties.game_name}</p>
          <p><strong>Author:</strong> {feature.properties.author}</p>
          <p><strong>Release Date:</strong> {formatDate(feature.properties.release_date)}</p>
          <p><strong>Location:</strong> {feature.properties.release_location_city}</p>
          <p><strong>Company:</strong> {feature.properties.company}</p>
          <p><strong>Original Price:</strong> US ${feature.properties.original_price_us}</p>
          <p><strong>2024 Equivalent Price:</strong> US ${feature.properties.price_2024}</p>
          <p><strong>Total Units Sold:</strong> {formatNumber(feature.properties.units_sold)}</p>
          
          {/* Scrollable Wikipedia Content */}
          <div
            style={{
              maxHeight: "100px", // Reduce scroll height on small screens
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
            }}
          >
            {wikiContent || "Loading Wikipedia content..."}
          </div>
  
          <p>
            <i>
            <a target="_blank" rel="noopener noreferrer" href={feature.properties.details_url}>
            Read more on Wikipedia
              </a>
            </i>
          </p>
          <div style={{fontSize: "5px"}}>
            <i>
              <a target="_blank" rel="noopener noreferrer" href={feature.properties.icon_attribution_url}>
                {feature.properties.icon_attribution_title}
              </a>
            </i>
          </div>
          </div>
        </Popup>
      </Marker>
    );
  });

  export default MemoizedMarker;