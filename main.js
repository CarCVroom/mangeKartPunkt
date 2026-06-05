const map = L.map("map").setView([61.11259539828107, 10.469975869146825], 14);
let marker;
let watchId;

const myIcon = L.icon({
        iconUrl: "./FAvico.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
}).addTo(map);

const points = [
        [61.111540628064624, 10.464557144441276], // Kirken
        [61.11543883867573, 10.463912997677328], // Kunstmuseum
        [61.115074973001875, 10.465480421002013], // Vinmonopolet
        [61.114756707332766, 10.46166297130153], // Stasjonen
        [61.11324801942486, 10.47215733814966] // Sykehuset helipad
];

points.forEach(([lat, lon], i) => {
        L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`Point ${i + 1}`);
})

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

function stop() {
        if (watchId) {
                navigator.geolocation.clearWatch(watchId);
        }
}
