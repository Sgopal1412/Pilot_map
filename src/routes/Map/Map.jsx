// import { useEffect, useRef, useState } from "react";
// import { Map, View } from "ol";
// import TileLayer from "ol/layer/Tile";
// import OSM from "ol/source/OSM";
// import "ol/ol.css";
// import VectorLayer from "ol/layer/Vector";
// import VectorSource from "ol/source/Vector";
// import { Style, Icon, Fill, Stroke } from "ol/style";
// import { fromLonLat } from "ol/proj";
// import Overlay from "ol/Overlay";
// import { Point, Circle as OL_Circle } from "ol/geom";
// import { Select } from "ol/interaction";
// import Feature from "ol/Feature";
// import pilotsData from "./map.json";

// let vectorSource = new VectorSource();
// let map;
// let userLocationFeature = null;

// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371; // Radius of the Earth in km
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in km
// };

// const addPilotsToMap = (pilots) => {
//   // Clear existing pilot features
//   vectorSource.getFeatures().forEach((feature) => {
//     if (!feature.get("isUserLocation")) {
//       // Check if the feature is not the user location marker
//       vectorSource.removeFeature(feature);
//     }
//   });

//   pilots.forEach((pilot) => {
//     const lonLat = [
//       parseFloat(pilot.coordinates.long),
//       parseFloat(pilot.coordinates.lat),
//     ];
//     const feature = new Feature({
//       geometry: new Point(fromLonLat(lonLat)),
//       name: pilot.name,
//     });

//     feature.setStyle(
//       new Style({
//         image: new Icon({
//           src: "/marker.png",
//           scale: 0.1,
//         }),
//       })
//     );

//     vectorSource.addFeature(feature);

//     const element = document.createElement("div");
//     element.innerHTML = `
//       <div style="width: 100%; height: auto;">
//           <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
//            ${pilot.name} is here
//           </div>
//           <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
//            ${pilot.workExperience}
//           </div>
//           <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
//            ${pilot.location}
//           </div>
//       </div>
//     `;
//     element.className = "tower-label";
//     element.style.fontSize = "8px";
//     element.style.fontWeight = "bold";
//     element.style.display = "flex";
//     element.style.flexDirection = "column";
//     element.style.alignItems = "flex-start";
//     element.style.background = "#fff";
//     element.style.width = "10vw";
//     element.style.height = "auto";
//     element.style.padding = "5px";
//     element.style.borderRadius = "10px";
//     element.style.cursor = "pointer";

//     element.addEventListener("click", () => {
//       console.log(`${pilot.name} is clicked`);
//     });

//     const overlay = new Overlay({
//       element: element,
//       positioning: "bottom-center",
//       stopEvent: true,
//       offset: [0, -50],
//     });

//     feature.set("overlay", overlay);
//     map.addOverlay(overlay);
//   });
// };

// const addCircleToMap = (centerLat, centerLon, radius) => {
//   const center = fromLonLat([centerLon, centerLat]);

//   const circle = new Feature({
//     geometry: new OL_Circle(center, radius * 1000), // radius in meters
//   });

//   circle.setStyle(
//     new Style({
//       stroke: new Stroke({
//         color: "rgba(255, 0, 0, 0.5)",
//         width: 2,
//       }),
//       fill: new Fill({
//         color: "rgba(255, 0, 0, 0.1)",
//       }),
//     })
//   );

//   // Remove existing circle if present
//   vectorSource.getFeatures().forEach((feature) => {
//     if (feature.get("isCircle")) {
//       vectorSource.removeFeature(feature);
//     }
//   });

//   circle.set("isCircle", true);
//   vectorSource.addFeature(circle);
// };

// const fetchData = (centerLat, centerLon, radius) => {
//   try {
//     const pilots = pilotsData;
//     const filteredPilots = pilots
//       .map((pilot) => {
//         const lat = parseFloat(pilot.coordinates.lat);
//         const lon = parseFloat(pilot.coordinates.long);
//         const distance = haversineDistance(centerLat, centerLon, lat, lon);
//         return { ...pilot, distance };
//       })
//       .filter((pilot) => pilot.distance <= radius)
//       .sort((a, b) => b.workExperience - a.workExperience) // Sort by work experience, descending
//       .slice(0, 10); // Get the top 10 pilots

//     addPilotsToMap(filteredPilots);
//     addCircleToMap(centerLat, centerLon, radius);
//   } catch (error) {
//     console.error("Error processing data:", error);
//   }
// };

// const MapComponent = () => {
//   const mapRef = useRef(null);
//   const [latitude, setLatitude] = useState("");
//   const [longitude, setLongitude] = useState("");
//   const [radius, setRadius] = useState("");

//   useEffect(() => {
//     map = new Map({
//       target: mapRef.current,
//       layers: [
//         new TileLayer({
//           source: new OSM({
//             preload: Infinity,
//             attributions: [],
//             controls: [],
//           }),
//         }),
//         new VectorLayer({
//           source: vectorSource,
//         }),
//       ],
//       view: new View({
//         center: fromLonLat([77.209023, 28.613939]), // Default view center
//         zoom: 5,
//       }),
//     });

//     const select = new Select();
//     map.addInteraction(select);

//     select.on("select", (event) => {
//       const selectedFeature = event.target.getFeatures().getArray()[0];
//       if (selectedFeature) {
//         const overlay = selectedFeature.get("overlay");
//         if (overlay) {
//           overlay.setPosition(selectedFeature.getGeometry().getCoordinates());
//         }
//       }
//     });

//     const addCurrentLocationMarker = (coords) => {
//       const lonLat = [coords.longitude, coords.latitude];

//       // Remove existing user location marker if any
//       if (userLocationFeature) {
//         vectorSource.removeFeature(userLocationFeature);
//       }

//       userLocationFeature = new Feature({
//         geometry: new Point(fromLonLat(lonLat)),
//       });

//       userLocationFeature.setStyle(
//         new Style({
//           image: new Icon({
//             src: "/myloc.png",
//             scale: 0.1,
//           }),
//         })
//       );

//       userLocationFeature.set("isUserLocation", true);
//       vectorSource.addFeature(userLocationFeature);
//     };

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         addCurrentLocationMarker({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       },
//       (error) => {
//         console.error("Error getting geolocation: ", error);
//       }
//     );

//     // Initially show all pilots
//     addPilotsToMap(pilotsData);

//     return () => map.setTarget(null);
//   }, []);

//   const handleShow = () => {
//     const centerLat = parseFloat(latitude);
//     const centerLon = parseFloat(longitude);
//     const range = parseFloat(radius);

//     if (!isNaN(centerLat) && !isNaN(centerLon) && !isNaN(range)) {
//       fetchData(centerLat, centerLon, range);
//     } else {
//       alert("Please enter valid latitude, longitude, and radius.");
//     }
//   };

//   return (
//     <>
//       <div>
//         <input
//           type="text"
//           placeholder="Latitude"
//           value={latitude}
//           onChange={(e) => setLatitude(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Longitude"
//           value={longitude}
//           onChange={(e) => setLongitude(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Radius (km)"
//           value={radius}
//           onChange={(e) => setRadius(e.target.value)}
//         />
//         <button onClick={handleShow}>Show</button>
//       </div>
//       <div id="map" ref={mapRef} className="map-container h-96 w-96" />
//     </>
//   );
// };

// export default MapComponent;


import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon, Fill, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import { Point, Circle as OL_Circle } from "ol/geom";
import { Select } from "ol/interaction";
import Feature from "ol/Feature";
import pilotsData from "./map.json";

let vectorSource = new VectorSource();
let map;
let userLocationFeature = null;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const addPilotsToMap = (pilots) => {
  // Clear existing pilot features
  vectorSource.getFeatures().forEach((feature) => {
    if (!feature.get("isUserLocation")) {
      // Check if the feature is not the user location marker
      vectorSource.removeFeature(feature);
    }
  });

  pilots.forEach((pilot) => {
    const lonLat = [
      parseFloat(pilot.coordinates.long),
      parseFloat(pilot.coordinates.lat),
    ];
    const feature = new Feature({
      geometry: new Point(fromLonLat(lonLat)),
      name: pilot.name,
    });

    feature.setStyle(
      new Style({
        image: new Icon({
          src: "/marker.png",
          scale: 0.1,
        }),
      })
    );

    vectorSource.addFeature(feature);

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="width: 100%; height: auto;">
          <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
           ${pilot.name} is here
          </div>
          <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
           ${pilot.workExperience}
          </div>
          <div style="display: flex; align-items: flex-start; padding: 10px; gap: 6px;">
           ${pilot.location}
          </div>
      </div>
    `;
    element.className = "tower-label";
    element.style.fontSize = "12px";
    element.style.fontWeight = "bold";
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.alignItems = "flex-start";
    element.style.background = "#fff";
    element.style.width = "10vw";
    element.style.height = "auto";
    element.style.padding = "5px";
    element.style.borderRadius = "10px";
    element.style.cursor = "pointer";

    element.addEventListener("click", () => {
      console.log(`${pilot.name} is clicked`);
    });

    const overlay = new Overlay({
      element: element,
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -50],
    });

    feature.set("overlay", overlay);
    map.addOverlay(overlay);
  });
};

const addCircleToMap = (centerLat, centerLon, radius) => {
  const center = fromLonLat([centerLon, centerLat]);

  const circle = new Feature({
    geometry: new OL_Circle(center, radius * 1000), // radius in meters
  });

  circle.setStyle(
    new Style({
      stroke: new Stroke({
        color: "rgba(255, 0, 0, 0.5)",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.1)",
      }),
    })
  );

  // Remove existing circle if present
  vectorSource.getFeatures().forEach((feature) => {
    if (feature.get("isCircle")) {
      vectorSource.removeFeature(feature);
    }
  });

  circle.set("isCircle", true);
  vectorSource.addFeature(circle);
};

const fetchData = (centerLat, centerLon, radius) => {
  try {
    const pilots = pilotsData;
    const filteredPilots = pilots
      .map((pilot) => {
        const lat = parseFloat(pilot.coordinates.lat);
        const lon = parseFloat(pilot.coordinates.long);
        const distance = haversineDistance(centerLat, centerLon, lat, lon);
        return { ...pilot, distance };
      })
      .filter((pilot) => pilot.distance <= radius)
      .sort((a, b) => b.workExperience - a.workExperience) // Sort by work experience, descending
      .slice(0, 10); // Get the top 10 pilots

    addPilotsToMap(filteredPilots);
    addCircleToMap(centerLat, centerLon, radius);
  } catch (error) {
    console.error("Error processing data:", error);
  }
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            preload: Infinity,
            attributions: [],
            controls: [],
          }),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: fromLonLat([84, 22]), // Default view center
        zoom: 5,
      }),
    });

    const select = new Select();
    map.addInteraction(select);

    select.on("select", (event) => {
      const selectedFeature = event.target.getFeatures().getArray()[0];
      if (selectedFeature) {
        const overlay = selectedFeature.get("overlay");
        if (overlay) {
          overlay.setPosition(selectedFeature.getGeometry().getCoordinates());
        }
      }
    });

    const addCurrentLocationMarker = (coords) => {
      const lonLat = [coords.longitude, coords.latitude];

      // Remove existing user location marker if any
      if (userLocationFeature) {
        vectorSource.removeFeature(userLocationFeature);
      }

      userLocationFeature = new Feature({
        geometry: new Point(fromLonLat(lonLat)),
      });
    //   const textStyle = new Style({
    //     text: new Text({
    //       text: "You are here",
    //       font: '12px sans-serif',
    //       fill: new Fill({ color: '#000' }),
    //       backgroundFill: new Fill({ color: '#fff' }),
    //       backgroundStroke: new Stroke({ color: '#000', width: 1 }),
    //       padding: [3, 5, 3, 5], // [top, right, bottom, left]
    //       offsetY: -40, // Adjust this to position the text above the marker
    //     }),
    //   });


      userLocationFeature.setStyle(
        new Style({
          image: new Icon({
            src: "/myloc.png",
            scale: 0.1,
          }),
        }),
      );

      userLocationFeature.set("isUserLocation", true);
      vectorSource.addFeature(userLocationFeature);

      // Set current location in state
      setCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude });
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        addCurrentLocationMarker({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting geolocation: ", error);
      }
    );

    // Initially show all pilots
    addPilotsToMap(pilotsData);

    return () => map.setTarget(null);
  }, []);

  const handleShow = () => {
    const centerLat = latitude ? parseFloat(latitude) : currentLocation?.latitude;
    const centerLon = longitude ? parseFloat(longitude) : currentLocation?.longitude;
    const range = parseFloat(radius);

    if (!isNaN(centerLat) && !isNaN(centerLon) && !isNaN(range) && currentLocation) {
      fetchData(centerLat, centerLon, range);
      map.getView().setCenter(fromLonLat([centerLon, centerLat]));
      map.getView().setZoom(10); // Zoom to the new location
    } else {
      alert("Please enter valid latitude, longitude, and radius or ensure you have a valid current location.");
    }
  };

  return (
    <>
      <div className="input-container">
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="input-con"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="input-con"
        />
        <input
          type="text"
          placeholder="Radius (km)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="input-con"
        />
        <button onClick={handleShow} className="input-con btn">Show</button>
      </div>
      <div id="map" ref={mapRef} className="map-container h-96 w-96" />
    </>
  );
};

export default MapComponent;

