var googleMapAPI ={
    map : null,
    markers : {hebergements : {gites: [],
                               chambres: []},
               points : {}},

    overlay : null,

    initialize : function()
    {
        this.map =  new google.maps.Map($('#map_div')[0], {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center:new google.maps.LatLng(50.417,4.450) ,
                        zoom: 7
                   });
        services.getPoints(['restaurant']);
        services.getHebergements();

        // Place polygon overlay
        this.overlay = new google.maps.Polygon({
            paths: [
                    [new google.maps.LatLng(51.6, 2.2),
                     new google.maps.LatLng(51.6, 6.9),
                     new google.maps.LatLng(49  , 6.9),
                     new google.maps.LatLng(49  , 2.2),
                     new google.maps.LatLng(51.6, 2.2)],
                    [new google.maps.LatLng(50.32, 6.40),
                     new google.maps.LatLng(50.75, 6.0),
                     new google.maps.LatLng(50.70, 3.24),
                     new google.maps.LatLng(50.31, 4.10),
                     new google.maps.LatLng(49.98, 4.13),
                     new google.maps.LatLng(49.94, 4.50),
                     new google.maps.LatLng(50.15, 4.88),
                     new google.maps.LatLng(49.80, 4.87),
                     new google.maps.LatLng(49.52, 5.83),
                     new google.maps.LatLng(49.94, 5.77),
                     new google.maps.LatLng(50.32, 6.40),]
            ],
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#00FF00",
            fillOpacity: 0.35
        });
        this.overlay.setMap(this.map);

    },


    createMarker : function(place, category)
    {
        var type = place.types[0];
        var icon = new google.maps.MarkerImage('images/icones/'+type+'.png');
        var marker = new google.maps.Marker(
            {
                map : this.map,
                position : place.geometry.location,
                icon:icon
            }
        );
        marker.checked = true;
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
                    case 'hebergements':
                        (marker.checked)?marker.setVisible(true):marker.setVisible(false);
                        break;

                    case 'points':
                        if (marker.checked && this.map.zoom > 9)
                        {
                            marker.setVisible(true);
                        }
                        else if (marker.checked && this.map.zoom <= 9)
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
