var googleMapAPI ={
    map : null,
    infowindow: null,
    //Wallonie center
    defaultCenter: new google.maps.LatLng(50.401078, 5.133648),
    defaultZoom: 10,
    zoomLimit: 13,
    markers : {primary : {gite: [],
        chambre: [],
        infotouristique: [],
        infopratique: [],
        maisontourisme: [],
        restaurant: [],
        evenementquefaire: []},
    secondary : {transport: [],
        culte: [],
        commerce: [],
        night: [],
        entertainment: [],
        city_hall: [],
        art_gallery: [],
        casino: [],
        library: [],
        park: [],
        spa: []}},
    subCategories: {transport: ['airport', 'bus_station'],
        culte: ['church', 'mosque', 'synagogue'],
        commerce: ['book_store', 'shopping_mall', 'store', 'bakery', 'grocery_or_supermarket'],
        night: ['bar', 'cafe', 'night_club'],
        entertainment: ['amusement_park', 'aquarium', 'museum', 'zoo'],
        city_hall: ['city_hall'],
        art_gallery: ['art_gallery'],
        casino: ['casino'],
        library: ['library'],
        park: ['park'],
        spa: ['spa']},

    overlay : null,

    initialize : function()
    {
        var mapInfos = services.getMapInfos();
        var zoom = (mapInfos.zoom !== null)?mapInfos.zoom:googleMapAPI.defaultZoom;

        if (mapInfos.center !== null)
        {
            var center = new google.maps.LatLng(mapInfos.center.latitude, mapInfos.center.longitude);
        }
        else
        {
            var center = googleMapAPI.defaultCenter;
        }

        this.map =  new google.maps.Map(jQuery('#map_div')[0], {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: center,
            zoom: zoom,
            minZoom: 8,
            panControl: false,
            keyboardShortcuts: false,
            streetViewControl: false,
            scaleControl: true,
            scaleControlOptions: {position: google.maps.ControlPosition.BOTTOM_LEFT},
        });

        //initialize infowindow
        this.infowindow = new google.maps.InfoWindow(
                {
                    size: new google.maps.Size(150,50)
                });

        this.overlay = new google.maps.Polygon();

        // Place polygon overlay
        this.overlay = new google.maps.Polygon({
            paths: [belgiumCoords.world,
            belgiumCoords.wallonie,
            belgiumCoords.comines],
            strokeColor: "#50C773",
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: "#CEEBD7",
            fillOpacity: 0.80
        });
        this.overlay.setMap(this.map);

        services.getPrimaryMarkers();
        if ( mapInfos.boundToAll == true)
        {
            googleMapAPI.boundToAllMarkers();
        }
        handlers.initHandlers();
    },

    createMarker : function(place, category)
    {
        // XXX ne pas creer un marker s il existe déjà dans googleMapAPI.markers !

        // Get the right type we want the marker to be added in
        if (category === 'secondary')
        {
            var type = undefined;
            var l = place.types.length;
            breakhere:
                for (var i=0; i < l; i++)
                {
                    for (var subCategory in googleMapAPI.subCategories)
                    {
                        var l2 = googleMapAPI.subCategories[subCategory].length;
                        for (var j=0; j < l2; j++)
                        {
                            if (place.types[i] === googleMapAPI.subCategories[subCategory][j])
                            {
                                type = subCategory;
                                break breakhere;
                            }
                        }

                    }
                }
        }
        else
        {
            type = place.types[0];
        }
        if (type === undefined)
        {
            // If no type found (must never append)
            return;
        }

        // Show number on the map
        var image = type;
        if ((type === 'gite' || type === 'chambre') && place.digit)
        {
            image = type + '_' + place.digit;
        }

        // window.portal_url added by plone
        var icon = new google.maps.MarkerImage(window.portal_url + '/' + '++resource++gites.map.images/'+image+'.png');
        var html;

        var location;

        // Coming from python
        if (place.latitude !== undefined)
        {
            html = place.name + "<br />" + place.vicinity;
            location = new google.maps.LatLng(place.latitude, place.longitude);
        }
        // It's a direct google map object
        else
        {
            html = "<b>" + place.name + "</b><br />" + place.vicinity;
            location = place.geometry.location;
        }

        var marker = new google.maps.Marker(
        {
            map : this.map,
            position : location,
            icon:icon
        });

        marker.checked = true;

        // Add listener for infowindow
        google.maps.event.addListener(marker, 'click', function() {
            googleMapAPI.infowindow.setContent(html);
            googleMapAPI.infowindow.open(googleMapAPI.map,marker);
        });

        googleMapAPI.markers[category][type].push(marker);
    },

    manageMarkersVisibility : function()
    {
        // Update visibility of all markers
        for (var category in this.markers){
            for (var type in this.markers[category]) {
                var l = this.markers[category][type].length;
                for (var i=0; i < l; i++) {
                    marker = this.markers[category][type][i];

                    switch (category)
                    {
                        // Hide or show primary marker if checkbox checked/unchecked
                        case 'primary':
                            (marker.checked)?marker.setVisible(true):marker.setVisible(false);
                            break;

                            // Hide or show secondary marker if checkbox checked/unchecked
                            //   or if dezoom to the limit
                        case 'secondary':
                            if (marker.checked && this.map.zoom > this.zoomLimit)
                            {
                                marker.setVisible(true);
                            }
                            else if (marker.checked && this.map.zoom <= this.zoomLimit)
                            {
                                marker.setVisible(false);
                            }
                            else
                            {
                                marker.setVisible(false);
                            }
                            break;
                    }
                };
            }
        }
    },

    deleteMarkersByType : function(type, category)
    {
        // Hide given markers
        var l = googleMapAPI.markers[category][type].length;
        for (var i=0; i < l; i++) {
            googleMapAPI.markers[category][type][i].setVisible(false);
        }
        // Remove marker
        googleMapAPI.markers[category][type] = [];
    },

    manageCheckboxDisabling : function()
    {
        if (this.map.zoom > this.zoomLimit)
            // dégriser les checkbox secondary_box
        {
            jQuery('input[name="secondary_box"]').each(function(index, checkBox)
                    {
                        checkBox.disabled = false;
                    });
        }

        // griser les checkbox secondary_box cochées si dezoom > limit
        else
        {
            jQuery('input[name="secondary_box"]').each(function(index, checkBox)
                    {
                        checkBox.disabled = true;
                    });
        }
    },
    boundToAllMarkers : function()
    {
        var bound = new google.maps.LatLngBounds();

        for (var category in this.markers) {
            for (var type in this.markers[category]) {
                var l = this.markers[category][type].length;
                for (var i=0; i < l; i++) {
                    marker = this.markers[category][type][i];
                    if (marker.checked)
                    {
                        bound.extend(marker.getPosition());
                    }
                };
            }
        }

        if (!bound.isEmpty())
        {
            this.map.fitBounds(bound);
        }
    },

    updateHebergementsMarkers : function(hebergements)
    {
        // Remove actual hebergements markers
        googleMapAPI.deleteMarkersByType('gite', 'primary');
        googleMapAPI.deleteMarkersByType('chambre', 'primary');

        // Add markers
        var l = hebergements.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.createMarker(hebergements[i],
                                      'primary');
        };

        googleMapAPI.boundToAllMarkers();
    },

    updateSecondaryMarkers : function()
    {
        if (googleMapAPI.map.zoom > googleMapAPI.zoomLimit)
        {
            // Empty secondarymarkers
            for (var type in googleMapAPI.markers['secondary'])
            {
                googleMapAPI.deleteMarkersByType(type, 'secondary');
            }

            // Prepare secondary types that are checked on template
            var types = [];
            jQuery('input[name="secondary_box"]').each(function(index, checkBox)
            {
                if ( jQuery(checkBox).prop('checked') )
                {
                    types.push(checkBox.value);
                }
            });

            // get secondarymarkers
            if (types !== [])
            {
                var l = types.length;
                for (var i=0; i < l; i++)
                {
                    services.getSecondaryMarkers(googleMapAPI.subCategories[types[i]]);
                }
            }
        }
    }

};
