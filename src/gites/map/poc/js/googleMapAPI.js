var googleMapAPI ={
    map : null,
    markers : {hebergements : {gites: [],
                               chambres: []},
               points : {}},

    overlay : null,
    zoomLimit: 9,

    initialize : function()
    {
        this.map =  new google.maps.Map($('#map_div')[0], {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center:new google.maps.LatLng(50.417,4.450) ,
                        zoom: 7
                   });
		this.overlay = new google.maps.Polygon();
        services.getPoints(['restaurant']);
        services.getHebergements();	
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
            $('input[name="point_box"]').each(function(index, checkBox)
                {
                    checkBox.disabled = false;
                });
        }

        // griser les checkbox point_box cochées si dezoom > limit
        else
        {
            $('input[name="point_box"]').each(function(index, checkBox)
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
	
	boundsChange :  function()
	{	
		this.overlay.setOptions(
			{
            paths: [
                    [
					 new google.maps.LatLng(this.map.getBounds().getSouthWest().lat(),this.map.getBounds().getNorthEast().lng()),
					 this.map.getBounds().getSouthWest(),
					 new google.maps.LatLng(this.map.getBounds().getNorthEast().lat(),this.map.getBounds().getSouthWest().lng()),					 
					 this.map.getBounds().getNorthEast()
					],
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
	}
};
