const map = L.map("map").setView([61.11259539828107, 10.469975869146825], 14);
let marker;
let watchId;
const out = document.getElementById('out');
let newPoints = false;
const dropdown = document.getElementById("valgOmLS");

const myIcon = L.icon({
        iconUrl: "./iconMap.jpg",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
}).addTo(map);

let points = [];
let APIURL = "https://carcvroom.pythonanywhere.com/api/data";

async function fetchPoints() {
        const response = await fetch(APIURL);
        points = await response.json();

        console.log(points)
}

let goneToPoints = [];
const markerLayer = L.layerGroup().addTo(map);

function checkLocalstorage(a) {
        if (!localStorage.getItem(a.toString())) {
                return a;
        } else {
                a = JSON.parse(localStorage.getItem(a.toString()));
                return a;
        }
}

function deleteLocalstorage(a) {
        a = a ?? dropdown.value;
        localStorage.removeItem(a);
}

function renderPoints() {
        markerLayer.clearLayers();

        points.forEach((point, i) => {
                L.marker([point.lat, point.lon])
                        .addTo(markerLayer)
                        .bindPopup(`${point.name}`);
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

fetchPoints()
start();
goneToPoints = checkLocalstorage(goneToPoints)
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
        const threshold = 30; // In meters

        points.forEach((point, i) => {
                const dist = getDistanceMeters(lat, lon, point.lat, point.lon);

                if (dist < threshold) {
                        goneToPoints.push(point);
                        addToLocalstorage(goneToPoints)

                        alert(`Went to point ${i}`)

                        if (goneToPoints.length === points.length) {
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

                points.push({
                        name: place,
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                });

                renderPoints();
                addToLocalstorage("points");
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
        addToLocalstorage("points");
}

function addToLocalstorage(a) {
        document.getElementById('output').innerHTML = goneToPoints.map(item => `<li>${item.name}</li>`).join('');

        let JSONpoints = JSON.stringify(a);
        localStorage.setItem(a.toString(), JSONpoints);
}
