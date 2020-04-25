mapboxgl.accessToken = 'pk.eyJ1IjoiaGFyc2hhMzExMCIsImEiOiJjazdydTBoYmYwaThlM25ucjR4MGh5OXc1In0.7ht60PgiBNbv6iz9Xm4y1Q';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-77.034084, 38.909671],
  zoom: 14
});

stores.features.forEach(function(store, i){
    store.properties.id = i;
});

map.on('load', function (e) {
    /* Add the data to your map as a layer */
    map.addLayer({
        "id": "locations",
        "type": "symbol",
        /* Add a GeoJSON source containing place coordinates and information. */
        "source": {
        "type": "geojson",
        "data": stores
        },
        "layout": {
        "icon-image": "restaurant-15",
        "icon-allow-overlap": true,
        }
    });
});