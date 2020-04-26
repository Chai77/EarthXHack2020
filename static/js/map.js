/* This will let you use the .remove() function later on */
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

// const socket = io.connect('http://localhost');
// socket.on('changed', (data) => {
//   console.log(data);
// });

//Make a fetch request to "http://localhost:3309/api/stores"

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFyc2hhMzExMCIsImEiOiJjazdydTBoYmYwaThlM25ucjR4MGh5OXc1In0.7ht60PgiBNbv6iz9Xm4y1Q';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/harsha3110/ck9g480050k2z1io25nryh6sb',
  center: [-96.994, 32.9693],
  zoom: 14
});

var stores ={
  "type": "FeatureCollection",
  "features": []
};

stores.features.forEach(function (store, i) {
  store.properties.id = i;
});

map.on('load', function (e) {
  /* Adding data to map as a layer */
  map.addSource('places', {
    type: 'geojson',
    data: stores
  });

  /* Add the data to your map as a layer */
  fetch('http://localhost:3309/api/stores')
  .then((response) => {
    return response.json();
  }).then((rawData) => {
    //(`store_id`, `name`, `category`, `capacity`, `phone`, `current_pop`, `username`, `password`, `street_address`, `zipcode`)
    var mapData = [];
    console.log("rawData");
    console.log(rawData);
    counter = 0;
    rawData.forEach(function(store){
      addToMap(store, rawData.length);
    });
    //outside for each
  });
});

let counter = 0;

 async function addToMap(store, length){
  if(store.street_address != null){
    feature =
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": 
            {
              lng: 0,
              lat: 0
            }
        },
        "properties": {
          "phoneFormatted": "",
          "phone": "",
          "address": "",
          "city": "",
          "country": "",
          "crossStreet": "",
          "postalCode": "",
          "name": ""
        }
      };
    var coords = [];
    coords = getLatLong(temp, feature, store, coords, length);
    
    function temp(feature, store, coords, length){
      console.log("coords");
      console.log(coords);
      feature.geometry.coordinates.lng = coords[0];
      feature.geometry.coordinates.lat = coords[1];
      feature.properties.phoneFormatted = formatPhone(store.phone);
      feature.properties.phone = store.phone;
      feature.properties.address = store.street_address;
      feature.properties.postalCode = store.zipcode;
      feature.properties.name = store.name;
      stores.features.push(feature);
      console.log("counter");
      counter++;
      if(counter === length) {
        func(stores);
      }
    } 
  }
}
//TODO: set counter=0

function getLatLong(_callback, feature, store, coords, length){
  const API_KEY = 'AIzaSyCfDEo7sik4-U-M5ptgRhj5Yw3IkFXv7rs';
  axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
    params:{
      address: store.street_address,
      key: API_KEY
    }
    
  }).then(function(response){
    coords.push(response.data.results[0].geometry.location.lng);
    coords.push(response.data.results[0].geometry.location.lat);
    _callback(feature, store, coords, length);
  });
}

function func(stores){
      console.log("gieorvnevrn");
      console.log(stores.features);
      buildLocationList(stores);
      addMarkers();
};

function formatPhone(phone){
  var output = "(";
  for (var i = 0; i < phone.length; i++) {
    if(output.length == 4)
      output += ") ";
    else if(output.length == 9)
      output += "-";
    output += phone.charAt(i);
  }
  return output;
}

function buildLocationList(data) {
  console.log("data");
  console.log(data.features);
  console.log(data.features.length);
  data.features.forEach(function (store, i) {
    console.log("this area was reached");
    console.log("store");
    console.log(store);
    /**
     * Create a shortcut for `store.properties`,
     * which will be used several times below.
    **/
    var prop = store.properties;
   
    /* Add a new listing section to the sidebar. */
    var listings = document.getElementById('listings');
    var listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = "listing-" + prop.name;
    console.log("id:"+prop.name);
    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = "link-" + prop.name;
    link.innerHTML = prop.address;

    /* Add details to the individual listing. */
    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.city;
    if (prop.phone) {
      details.innerHTML += ' · ' + prop.phoneFormatted;
    }

    link.addEventListener('click', function (e) {
      //   console.log(this.dataPosition);
      var clickedListing = data.features[i];
      //   console.log(clickedListing);
      flyToStore(clickedListing);
      createPopUp(clickedListing);

      var activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });
  });
}

function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML('<h3>Sweetgreen</h3>' +
      '<h4>' + currentFeature.properties.address + '</h4>')
    .addTo(map);
}



function addMarkers() {
  /* For each feature in the GeoJSON object above: */
  stores.features.forEach(function (marker) {
    /* Create a div element for the marker. */
    var el = document.createElement('div');
    /* Assign a unique `id` to the marker. */
    el.id = "marker-" + marker.properties.id;
    /* Assign the `marker` class to each marker for styling. */
    el.className = 'marker';

    /**
     * Create a marker using the div element
     * defined above and add it to the map.
    **/
    new mapboxgl.Marker(el, { offset: [0, -23] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
    el.addEventListener('click', function (e) {
      /* Fly to the point */
      flyToStore(marker);
      /* Close all other popups and display popup for clicked store */
      createPopUp(marker);
      /* Highlight listing in sidebar */
      var activeItem = document.getElementsByClassName('active');
      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      var listing = document.getElementById('listing-' + marker.properties.id);
      listing.classList.add('active');
    });
  });
}