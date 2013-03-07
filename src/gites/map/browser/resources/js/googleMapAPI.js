var googleMapAPI ={
    map : null,
    infowindow: null,
    wallonieCenter: new google.maps.LatLng(50.401078, 5.133648),
    markers : {primary : {gites: [],
                               chambres: [],
                               infotouristique: [],
                               infopratique: [],
                               maisontourisme: []},
               secondary : {}},

    overlay : null,
    zoomLimit: 9,

    initialize : function()
    {
        this.map =  new google.maps.Map(jQuery('#map_div')[0], {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center: googleMapAPI.wallonieCenter,
                        zoom: 7,
//                        minZoom: 5,
                   });

        //initialize infowindow
        this.infowindow = new google.maps.InfoWindow(
        {
            size: new google.maps.Size(150,50)
        });

        this.overlay = new google.maps.Polygon();

        // XXX aller chercher ces types directement dans l html de la page (les value des secondary_box) qui sont checked
        services.getSecondaryMarkers(['restaurant']);

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
        this.boundToAllMarkers();
        handlers.initHandlers();
    },


    createMarker : function(place, category)
    {
        var type = place.types[0];
        var icon = new google.maps.MarkerImage('++resource++gites.map.images/'+type+'.png');
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
            }
        );

        marker.checked = true;

        // Add listener for infowindow
        google.maps.event.addListener(marker, 'click', function() {
            googleMapAPI.infowindow.setContent(html);
            googleMapAPI.infowindow.open(googleMapAPI.map,marker);
        });

        googleMapAPI.markers[category][type].push(marker);
    },

    checkSecondaryMarkersExists: function(nameMarker)
    {
       return (this.markers.secondary[nameMarker] != undefined)?true:false;
    },

    manageMarkersVisibility : function()
    {
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
    }
};
