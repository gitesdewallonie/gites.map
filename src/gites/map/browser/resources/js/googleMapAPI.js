var googleMapAPI ={
    map : null,
    infowindow: null,
    markers : {hebergements : {gites: [],
                               chambres: []},
               points : {}},

    overlay : null,
    zoomLimit: 9,

    initialize : function()
    {
        this.map =  new google.maps.Map(jQuery('#map_div')[0], {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center:new google.maps.LatLng(50.417,4.450) ,
                        zoom: 7,
                        minZoom: 5,
                   });

        //initialize infowindow
        this.infowindow = new google.maps.InfoWindow(
        {
            size: new google.maps.Size(150,50)
        });

        this.overlay = new google.maps.Polygon();
        services.getPoints(['restaurant']);
        services.getHebergements();

        // Place polygon overlay
        this.overlay = new google.maps.Polygon({
            paths: [belgiumCoords.world,
                    belgiumCoords.wallonie,
                    belgiumCoords.comines],
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#00FF00",
            fillOpacity: 0.35
        });
        this.overlay.setMap(this.map);

        services.getHebergements();
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
            html = place.name + place.vicinity;
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

    checkPointsMarkersExists: function(nameMarker)
    {
       return (this.markers.points[nameMarker] != undefined)?true:false;
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
                    // Hide or show hebergement marker if checkbox checked/unchecked
                    case 'hebergements':
                        (marker.checked)?marker.setVisible(true):marker.setVisible(false);
                        break;

                    // Hide or show point marker if checkbox checked/unchecked
                    //   or if dezoom to the limit
                    case 'points':
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
        // dégriser les checkbox point_box
        {
            jQuery('input[name="point_box"]').each(function(index, checkBox)
                {
                    checkBox.disabled = false;
                });
        }

        // griser les checkbox point_box cochées si dezoom > limit
        else
        {
            jQuery('input[name="point_box"]').each(function(index, checkBox)
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
