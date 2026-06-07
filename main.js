const map = L.map("map").setView([61.11259539828107, 10.469975869146825], 14);
let marker;
let watchId;
const out = document.getElementById('out');
let newPoints = false;

const myIcon = L.icon({
        iconUrl: "./FAvico.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
}).addTo(map);

let points = [
        [61.111540628064624, 10.46455714444127], // Kirken
        [61.11543883867573, 10.463912997677328], // Kunstmuseum
        [61.115074973001875, 10.465480421002013], // Vinmonopolet
        [61.114756707332766, 10.46166297130153], // Stasjonen
        [61.11324801942486, 10.47215733814966] // Sykehuset helipad
];

let goneToPoints = [];
const markerLayer = L.layerGroup().addTo(map);

function checkLocalstorage(a) {
        if (!localStorage.getItem('points')) {
                return a;
        } else {
                a = JSON.parse(localStorage.getItem('points'));
                return a;
        }
}

function deleteLocalstorage() {
        localStorage.removeItem('points');
}

function renderPoints() {
        console.log(markerLayer.getLayers().length);
        markerLayer.clearLayers();

        points.forEach(([lat, lon], i) => {
                L.marker([lat, lon])
                        .addTo(markerLayer)
                        .bindPopup(`Point ${i + 1}`);
        });
}

function start() {
        if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;

                        if (!marker) {
                                marker = L.marker([lat, lon], { icon: myIcon }).addTo(map);
                        } else {
                                marker.setLatLng([lat, lon]);
                        }

                        map.setView([lat, lon]);

                        out.innerHTML = `Latitude: ${lat} <br>longitude: ${lon}`

                        checkNearby(lat, lon)

                        },
                        (error) => {
                                console.log("error", error);
                        },
                        {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 0
                        }
                );
        } else {
                console.log("geolocation er ikke støttet");
        }
}

start();
points = checkLocalstorage(points);
renderPoints();

function getDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;

        const toRad = (deg) => deg * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c
}

function checkNearby(lat, lon) {
        const threshold = 10; // In meters

        points.forEach(([pLat, pLon], i) => {
                const dist = getDistanceMeters(lat, lon, pLat, pLon);

                if (dist < threshold) {
                        goneToPoints.push(i);

                        alert(`Went to point ${i}`)

                        if (goneToPoints.length === 5) {
                                alert("You have gone to all points")
                                stop();
                        }
                }
        })
}

async function searchPlace() {
        let place = document.getElementById('inputSearch').value;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
        console.log(url)

        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
                if (newPoints === false) { points.length = 0; }
                newPoints = true;

                points.push([parseFloat(data[0].lat),
                             parseFloat(data[0].lon)]);
                console.log(points)

                renderPoints();
                addToLocalstorage();
        }
}

function stop() {
        alert("Stopped")
        if (watchId) {
                navigator.geolocation.clearWatch(watchId);
        }
}

function deleteLatestEntry() {
        points.pop();
        renderPoints();
        console.log(points)
        addToLocalstorage();
}

function addToLocalstorage() {
        let JSONpoints = JSON.stringify(points);
        localStorage.setItem('points', JSONpoints);
}
