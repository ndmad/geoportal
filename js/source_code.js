var map;
var lyrOSM;
var osmtopo;
var dark;
var googleStreets;
var googleHybrid;
var googleSat;
var googleTerrain;
var legendControl;
var baseMaps;
var overlayMaps;
var communesLayer;
var nomPoints;
var com;


var ctlMousePosition;
var ctlMeasure;
var ctlEasyButton;
var ctlSidebar;

var iconPointOne;
var iconPointTwo;
var lyrPointCluster;



$(document).ready(function () {

    // create map object
    map = L.map('map', { attributionControl: false }).setView([14.6919, -17.4474,], 8);

    //add basemap layer
    // lyrOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
    lyrOSM = L.tileLayer("https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png");
    osmtopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');

    map.addLayer(lyrOSM);


    // Layers
    dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    // googlr street
    googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // google googleHybrid
    googleHybrid = L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Google map
    googleSat = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google terrain
    var googleTerrain = L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    baseMaps = {
        "OSM": lyrOSM,
        "OSPTopo": osmtopo,
        "Dark Map": dark,
        "Google Streets": googleStreets,
        "Google Hybrid": googleHybrid,
        "Google Satellite": googleSat,
        "Google Terrain": googleTerrain
    };


    // Nom Ponts

    lyrPointCluster = L.markerClusterGroup();
    iconPointOne = L.AwesomeMarkers.icon({ icon: "tree", markerColor: 'green', iconColor: 'white', prefix: 'fa' });
    iconPointTwo = L.AwesomeMarkers.icon({ icon: "leaf", markerColor: 'green', iconColor: 'red', prefix: 'fa', spin: true });

    // Ajout couche commune


    // Charger des points
    nomPoints = L.geoJson.ajax('data/ecoposphar.geojson', { pointToLayer: funReturnPoints });
    nomPoints.on('data:loaded', function () {
        map.fitBounds(map.getBounds());
        lyrPointCluster.addLayer(nomPoints);
        lyrPointCluster.addTo(map);
    });

   
    // Add geoJson files to map
    // bindTooltip
    //bindPopup
   

   // Assurez-vous que vous avez inclus jQuery dans votre fichier HTML avant d'utiliser ce script

$('.edu1').on('click', function (e) {
    // Ici, vous pouvez vérifier si l'élément cliqué a une classe spécifique ou un ID, par exemple
    if ($(this).hasClass('edu1')) {
        // Appeler votre fonction loadCommunesData()
        loadCommunesData();
    }
});


// Initialisation de l'objet overlayMaps à l'extérieur de la fonction
var overlayMaps = {
    "Nom": lyrPointCluster,
    // ... d'autres couches si elles existent déjà
};

var layersControl = L.control.layers(baseMaps, overlayMaps).addTo(map);




var communesLayer; // Déclarer la variable à l'échelle globale

function loadCommunesData() {
    $.ajax({
        dataType: 'json',
        url: 'data/communes.geojson',
        success: function (data) {
            communesLayer = L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    layer.bindTooltip('<b>Nom : </b>' + feature.properties.ccrca + '<br>' + '<b>Nbre hts: </b>' + feature.properties.total);
                },
                style: {
                    fillColor: 'red',
                    fillOpacity: 0.0,
                    stroke: true,
                    color: 'black',
                    weight: 1.5
                }
            });

            // Vérifiez si la clé "Communes" existe déjà dans overlayMaps
            if (!overlayMaps["Communes"]) {
                // Si non, ajoutez la couche à overlayMaps
                overlayMaps["Communes"] = communesLayer;
                // Mettez à jour le contrôle de couches avec la nouvelle couche
                layersControl.addOverlay(communesLayer, "Communes");
            }

            // Ajoutez la couche à la carte
            communesLayer.addTo(map);

            // Initialisez la recherche après avoir chargé les données
            initializeSearchControl();
        },
        error: function (xhr, status, error) {
            console.error('Erreur lors du chargement des données :', status, error);
        }
    });
}

// Déclarer une variable pour stocker les résultats des recherches précédentes
var recherchePrecedenteLayer;

// Fonction pour initialiser le contrôle de recherche
function initializeSearchControl() {
    map.addControl(new L.Control.Search({
        layer: communesLayer,
        propertyName: "ccrca",
        initial: false,
        zoom: 15,
        marker: false,
        moveToLocation: function(latlng, title, map) {
            // Supprimer les résultats de recherche précédents s'ils existent
            if (recherchePrecedenteLayer) {
                map.removeLayer(recherchePrecedenteLayer);
            }

            // Obtenez la commune correspondante à partir de la couche GeoJSON
            var foundCommune = communesLayer.getLayers().find(function(layer) {
                return layer.feature.properties.ccrca === title;
            });

            // Créez une nouvelle couche polygonale pour représenter la commune recherchée
            var highlightLayer = L.polygon(foundCommune.getLatLngs(), {
                fillColor: 'yellow',
                fillOpacity: 0.2,
                color: 'red',  // Couleur de la bordure
                weight: 3,      // Épaisseur de la bordure
            }).addTo(map);

            // Ajustez le zoom pour afficher la commune entière
            map.fitBounds(highlightLayer.getBounds());

            // Stocker la couche de la recherche actuelle pour suppression ultérieure
            recherchePrecedenteLayer = highlightLayer;
        },
        markerIcon: L.divIcon({
            className: 'leaflet-div-icon custom-marker-icon',
            html: '<i class="fa fa-map-marker fa-2x" style="background: transparent;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        }),
        circleLocation: false,
        circleStyle: {
            fillColor: 'transparent',
            stroke: false,
        },
    }));
}

// Chargez les données dès que la page est prête
$(document).ready(function () {
    loadCommunesData();
});



    //map.zoomControl.setPosition('bottomright');

    

    // Écoutez l'événement de recherche pour ajuster la position du marqueur
    map.on('search:locationfound', function (e) {
        // Réglez la position du marqueur sur le centre du cercle de recherche
        e.layer.setLatLng(e.layer.getBounds().getCenter());
    });

    // Add the fullscreen control to the map: 
    map.addControl(new L.Control.Fullscreen());
    // add scare bar
    L.control.scale().addTo(map);
    // add geocoder
    // L.Control.geocoder().addTo(map);

    // My position location
    L.control.locate({
        position: "topright",
        strings: {
            title: "Show me where I am, yo!"
        }
    }).addTo(map);

    ctlMousePosition = L.control.mousePosition().addTo(map);
    ctlMeasure = L.control.polylineMeasure().addTo(map);
    ctlSidebar = L.control.sidebar('side-bar').addTo(map);
    ctlEasyButton = L.easyButton('fa-exchange', function () {
        ctlSidebar.toggle();
    }).addTo(map);


    // FUNCTION

    //custom functions
    function latLngToString(ll) {
        return "[" + ll.lat.toFixed(5) + "," + ll.lng.toFixed(5) + "]";
    }

    // SIDEBAR FUNCTIONS
    $('.edu1').hide();
    $('#edu').on('click', function (e) {
        $('.edu1').slideToggle();
    });

    $('.mob1').hide();
    $('#mob').on('click', function () {
        $('.mob1').slideToggle();
    });

    $('.san1').hide();
    $('#san').on('click', function () {
        $('.san1').slideToggle();
    });

    $('.pat1').hide();
    $('#pat').on('click', function () {
        $('.pat1').slideToggle();
    });

    $('.eco1').hide();
    $('#eco').on('click', function () {
        $('.eco1').slideToggle();
    });

    // function on Points layer

    function funReturnPoints(nomPoints, latlng) {
        var att = nomPoints.properties;
        if (att.fclass == 'school') {
            var pointColor = 'green';
        } else if (att.fclass == 'bank') {
            var pointColor = 'red';
        } else {
            var pointColor = 'yellow';
        }
        return L.circleMarker(latlng, { radius: 10, color: pointColor })
            .bindTooltip('<h4>fclass:' + att.fclass + '</h4>');
    }

    // function on Points layer

    function funReturnPoints(nomPoints, latlng) {
        var att = nomPoints.properties;
        switch (att.fclass) {
            case 'school':
                var optPoints = { radius: 10, color: 'pink', fillColor: 'pink', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'bank':
                var optPoints = { radius: 10, color: 'yellow', fillColor: 'Darkorange', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'pharmacy':
                var optPoints = { radius: 10, color: 'green', fillColor: 'green', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'supermarket':
                var optPoints = { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'computer_shop':
                var optPoints = { radius: 10, color: 'Teal', fillColor: 'Teal', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'kiosk':
                var optPoints = { radius: 10, color: 'green', fillColor: 'green', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'university':
                var optPoints = { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'fast_food':
                var optPoints = { radius: 10, color: 'Teal', fillColor: 'Teal', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'kindergarten':
                var optPoints = { radius: 10, color: 'Cyan', fillColor: 'Cyan', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'veterinary':
                var optPoints = { radius: 10, color: 'Maroon', fillColor: 'Maroon', fillOpacity: 0.5, dashArray: "2,8" };
                break;
            case 'pub':
                var optPoints = { radius: 10, color: 'DarkRed', fillColor: 'DarkRed', fillOpacity: 0.5, dashArray: "2,8" };
                break;

        }
        return L.circleMarker(latlng, optPoints)
            .bindTooltip('<h4>fclass:' + att.fclass + '</h4>');
    }


    // }
    // function on Points layer

    //function funReturnPoints(nomPoints, latlng){
    //var att = nomPoints.properties;
    //if(parseInt(att.id) <=10){
    // var pointIcon = iconPointOne;  
    //}else{
    //var pointIcon  = iconPointTwo;
    //}
    //return L.marker(latlng, {radius:15, color:pointIcon})
    //.bindTooltip('<h4>fclass:'+att.fclass+'</h4>');
    // }

    // Importation data from local storage
    (function (window) {
        'use strict';

        function initMap() {
            var control;
            var L = window.L;

            var style = {
                color: 'red',
                opacity: 1.0,
                fillOpacity: 1.0,
                weight: 2,
                clickable: false
            };

            L.Control.FileLayerLoad.LABEL = '<img class="icon" src="images/folder.svg" alt="file icon"/>';
            control = L.Control.fileLayerLoad({
                fitBounds: true,
                layerOptions: {
                    style: style,
                    pointToLayer: function (data, latlng) {
                        return L.circleMarker(
                            latlng,
                            { style: style }
                        );
                    }
                }
            });
            control.addTo(map);
            control.loader.on('data:loaded', function (e) {
                var layer = e.layer;
                console.log(layer);
            });
        }

        window.addEventListener('load', function () {
            initMap();
        });
    }(window));

});


