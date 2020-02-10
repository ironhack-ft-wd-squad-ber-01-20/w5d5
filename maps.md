# Adding a map to the IronRoom Project

## Mapbox setup

Head over to [the mapbox website](https://www.mapbox.com/) and sign up or sign in to get started.
In the following screens, select the _JS SDK_ and the _Mapbox CDN_ options.

<!-- blank line -->
<figure class="video_container">
  <iframe  width="843" height="505" src="https://youtube.com/embed/PrzAvUUdVnQ" frameborder="0" allowfullscreen="true" ></iframe>
</figure>
<!-- blank line -->

We added the mapbox js `<script>` and css `<link>` in the `<head>` tag located in our `layout.hbs` and t he following code in the page where we want to display the map: `room/detail.hbs`:

```html
<!-- This is an empty `<div>` to which we give an `id` to target it in the `js` later on, to make it our container for the map and that we can also set dimensions for -->
<div id="map" style="width: 400px; height: 300px;"></div>

<script>
  mapboxgl.accessToken =
    "pk.eyJ1IjoibWppaCIsImEiOiJjanVwb3p2M2kxczk2M3ptcDRlc2cwYTZpIn0.B8dDJ9aejgRYjjc1hh2w1g"; // the mapbox token is required to display the map
  const map = new mapboxgl.Map({
    container: "map", // this refers to the `id` attribute that we gave to our empty div in the HTML
    style: "mapbox://styles/mapbox/streets-v11" // mapbox comes with a preset of styles that we can use and allows to customize and share map styles with other users
  });
</script>
```

We can put the script at the bottom of the view, inline (or embedded), or separate it from the markup by extracting the code between the `<script></script>` tags to a separate `.js` file.  
We put it at the bottom to ensure that any HTML element has loaded if we need to perform any DOM manipulation for instance. By now the map should show. Try swapping the `<div>` and the `<script>`, what happens ?

## Styles

Mapbox exposes the following styles that we can use in the `style` property in the options object passed to the `mapboxgl.Map` constructor:

- [https://docs.mapbox.com/api/maps/#mapbox-styles](https://docs.mapbox.com/api/maps/#mapbox-styles)

But we can also use styles created by other users (and create and share ours):

- [Mapbox Styles Gallery](https://www.mapbox.com/gallery/)

<!-- blank line -->
<figure class="video_container">
  <iframe width="843" height="505" src="https://youtube.com/embed/UwrC6TH3AzY" frameborder="0" allowfullscreen="true"></iframe>
</figure>
<!-- blank line -->

## Map options

[Mapbox API Reference](https://docs.mapbox.com/mapbox-gl-js/api/)

Here are some examples of properties that we can pass to the `Map` constructor:

```js
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mjih/ck6fkrthf7xq31io06u4kehl7",
  center: [13.405, 52.52], // the [longitude, latitude] coordinates for the center of the map, default is [0, 0] or the center defined for the current style if there is
  zoom: 12, // the zoom level, from 0 (zoomed out) to 24
  maxBounds: [
    [13.2, 52.4],
    [13.6, 52.65]
  ] // we can also set boundaries to the map, useful if we don't want users to wander outside of the scope of our application's content
});
```

## User Interface

We can improve the user experience by adding controls to our map.  
The simple controls to display zoom in/out buttons and a compass with [NavigationControl](https://docs.mapbox.com/mapbox-gl-js/api/#navigationcontrol)

```js
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, "top-right"); // where map refers to the name of our instance of Map
```

We can also if needed add a [GeolocateControl](https://docs.mapbox.com/mapbox-gl-js/api/#geolocatecontrol) if the user's browser supports it, and which will allow the user to be located if they agree to it:

```js
const geolocate = new mapboxgl.GeolocateControl({
  showUserLocation: false, // default is true, defines whether a dot should be shown where user is located
  trackUserLocation: true // default is false, allows to update user location on the map if the user's location changes
});
map.addControl(geolocate, "top-right");
```

## Interacting with the map

### Adding a marker

Let's start by adding a `<button>` to the HTML:

```html
<button id="add-marker">
  Add a marker
</button>
```

And in the `<script>` we'll create a [Marker](https://docs.mapbox.com/mapbox-gl-js/api/#marker) and add it to the map:

```js
document.getElementById("add-marker").onclick = () => {
  const marker = new mapboxgl.Marker({
    draggable: true // we can set a marker to be draggable (we'll see how that is useful), default is false
  });
  const centerCoords = map.getCenter(); // .getCenter() retrieves an object with `lng` and `lat` properties
  marker.setLngLat(centerCoords); // that we can  use to set the Lng and Lat of our marker, but we could also use an array of [lng, lat] like we did previously for the center
  marker.addTo(map); // finally, the marker has to be added to the map for it to appear
};
```

This will create a marker when the `button` with id `add-marker` is clicked, at the center of the map.

### Adding a popup

We will start by creating an instance of [Popup](https://docs.mapbox.com/mapbox-gl-js/api/#popup)

```js
const popup = new mapboxgl.Popup();
popup.setLngLat(map.getCenter());
popup.setHTML("<div><h1>Hello World</h1></div>");
popup.addTo(map);
```

This will add a Popup that can be closed and that will display the HTML passed to `setHTML`. We can also make them appear upon clicking on a [symbol](https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/) or the marker we created earlier.

```js
const marker = new mapboxgl.Marker();
const centerCoords = map.getCenter();
marker.setLngLat(centerCoords);
marker.addTo(map);

const popup = new mapboxgl.Popup();
popup.setLngLat(map.getCenter());
popup.setHTML("<div><h1>Hello World</h1></div>");

marker.setPopup(popup); // this attaches the popup we created to the marker, and when the marker is clicked the popup will appear
```

### Detecting drag events

We set earlier a property `draggable` to our marker. Let's see how we can detect the new position of the marker when it is dragged:

```js
const marker = new mapboxgl.Marker({ draggable: true });
const centerCoords = map.getCenter();
marker.setLngLat(centerCoords);
marker.addTo(map);

// we can detect different events related to the marker, `drag` as long as the marker is being dragged, `dragstart` and `dragend`
marker.on("dragend", data => {
  const coord = data.target.getLngLat();
  // `coord` will be a `lngLat` mapbox object that we can turn into an array with `.toArray()` if we store coordinates as [lng, lat]

  /*
  Here is where we could perform an axios call to update the coordinates for the room for example
  */
});
```

## Connecting the map to our project

### Updating the Room schema

We'll add a property to our schema in `models/Room.js`

```js
const roomSchema = new Schema({
  description: String,
  name: String,
  price: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  coordinates: [Number]
});
```

The coordinates will be stored as an array [lng, lat], but there are other options (see [GeoJSON support](https://mongoosejs.com/docs/geojson.html)).

### Adding a route to update the Room

We'll add a `PATCH` route on the server to handle the request we'll make to update the Room document after dragging the marker.

```js
router.patch("/rooms/:id", (req, res, next) => {
  const changes = req.body; // in our axios call on the front-end, we'll make sure to pass the fields that need to be updated
  Room.updateOne({ _id: req.params.id }, changes)
    .then(() => {
      // successful update, we can send a response
      res.json();
    })
    .catch(err => {
      next(err);
    });
});
```

### Making the API call

Where we retrieved the new coordinates after the drag is where we'll perform the axios call to the route we just registered on the server:

```js
marker.on("dragend", data => {
  const coord = data.target.getLngLat().toArray(); // `.toArray()` to fit our Room schema's requirements
  const roomId = location.pathname.split("/")[2]; // retrieving the roomId from the url
  axios
    .patch(`http://localhost:3000/rooms/${roomId}`, { coordinates: coord }) // the first argument is the path of the route we registered on the server and the second is the object with the properties that need to be updated: `coordinates` is the name of the field in our Room documents and `coord` is the reference to the variable that holds the updated coordinates of the marker
    .then(() => {
      console.log("Room updated!");
    })
    .catch(err => {
      console.log(err);
    });
});
```

We can check on Compass that the room was updated:

![Room with coordinates](https://i.imgur.com/1l2gtaY.png)

Perfect! We are only missing one step: instead of displaying the marker on the geographical center of the map, how about we use the coordinates that we just saved ?

### Retrieving the saved coordinates

Let's start by creating a route on the server that will return the coordinates for a room with a given `_id`:

```js
router.get("/rooms/:id/coordinates", (req, res, next) => {
  Room.findById(req.params.id) // retrieve the room from the DB
    .then(roomDocument => {
      res.json(roomDocument.coordinates); // return as a JSON, the array of coordinates
    })
    .catch(err => {
      next(err);
    });
});
```

We will make a `GET` request to this route in order to set the coordinates of our marker when we add to the map.

```js
const roomId = location.pathname.split("/")[2];
axios
  .get(`http://localhost:3000/rooms/${roomId}/coordinates`)
  .then(response => {
    let coordinates = response.data; // the array of coordinates that we are sending from our backend route
    if (!coordinates.length) coordinates = map.getCenter(); // if the room didn't have coordinates, we'll use the center of the map temporarily to display the marker

    const marker = new mapboxgl.Marker({ draggable: true });

    marker.setLngLat(coordinates); // and we'll use that array as the coordinates for our marker
    marker.addTo(map);

    marker.on("dragend", data => {
      const coord = data.target.getLngLat().toArray();

      axios
        .patch(`http://localhost:3000/rooms/${roomId}`, { coordinates: coord })
        .then(() => {
          console.log("Room updated!");
        })
        .catch(err => {
          console.log(err);
        });
    });
  })
  .catch(err => {
    console.log(err);
  });
```

Aaaaand we're done!

[Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/examples/)  
[Mapbox Tutorials](https://docs.mapbox.com/help/tutorials/)
