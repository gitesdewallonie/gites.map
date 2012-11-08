(function($)
{
    $(document).ready(function() {
        googleMapAPI.initialize();
    });

    var handlers = {
        initHandlers : function()
        {
            $('input[name="point_box"]').bind({'change':this.pointCheckboxHandler});
            $('input[name="hebergement_box"]').bind({'change':this.hebergementCheckboxHandler});
            $('input#bound_button').bind({'click':this.boundHandler});
            google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler);
        },

        pointCheckboxHandler: function(event)
        {
            if(googleMapAPI.checkPointsMarkersExists(event.target.value))
            {
                var markersToManage = googleMapAPI.markers.points[event.target.value];
                var l = markersToManage.length;
                for (var i=0; i < l; i++) {
                    markersToManage[i].checked = $(this).prop('checked');
                };
            } else{
                services.getPoints([event.target.value]);
            }
            googleMapAPI.manageMarkersVisibility(true);
        },

        hebergementCheckboxHandler: function(event)
        {
            var markersToManage = googleMapAPI.markers.hebergements[event.target.value];
            var l = markersToManage.length;
            for (var i=0; i < l; i++) {
                markersToManage[i].checked = $(this).prop('checked');
            };
            googleMapAPI.manageMarkersVisibility();
        },

        zoomHandler : function(event)
        {
            (this.zoom<9)?googleMapAPI.managePointsMarkersVisibility(false):googleMapAPI.managePointsMarkersVisibility(true);
        },

        boundHandler : function(event)
        {
            googleMapAPI.boundToAllMarkers();
        }
    };

    var googleMapAPI ={
        map : null,
        markers : {hebergements : {gites: [],
                                   chambres: []},
                   points : {}},

        initialize : function()
        {
            this.map =  new google.maps.Map($('#map_div')[0], {
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            center:new google.maps.LatLng(50.417,4.450) ,
                            zoom: 10
                       });
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
                        (marker.checked)?marker.setVisible(true):marker.setVisible(false);
                    };
                }
            }
        },

        managePointsMarkersVisibility : function(isVisible)
        {
            for (var category in this.markers){
                for (var type in this.markers.points) {
                    var l = this.markers.points[type].length;
                    for (var i=0; i < l; i++) {
                        marker = this.markers.points[type][i];
                        if (marker.checked)
                        {
                            marker.setVisible(isVisible);
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

    var services = {
        getPoints : function(types)
        {
            var l = types.length;
            for (var i=0; i < l; i++) {
                googleMapAPI.markers.points[types[i]]=[];
                var request = {
                    location:new google.maps.LatLng(50.417,4.450),
                    radius:5000,
                    types:[types[i]]
                };
                var service = new google.maps.places.PlacesService(googleMapAPI.map);
                service.nearbySearch(request, services.callBack_getPoints);
            };

        },

        callBack_getPoints : function(result,status)
        {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var l = result.length;
                for (var i=0; i < l; i++) {
                    googleMapAPI.createMarker(result[i], 'points');
                };
                handlers.initHandlers();
            }
        },

        getHebergements : function() //Temporary creating fake gites
        {
            var request = {
                location:new google.maps.LatLng(50.417,4.450),
                radius:5000,
                types:['cafe', 'hospital']
            };
            var service = new google.maps.places.PlacesService(googleMapAPI.map);
            service.nearbySearch(request, services.callBack_getHebergements);
        },

        callBack_getHebergements : function(result,status)
        {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var l = result.length;
                for (var i=0; i < l; i++) {

                    //Temporary change 'cafe' to 'gites' and 'hospital' to 'chambres'
                    if (result[i].types[0] === 'cafe')
                    {
                        result[i].types = ['gites'];
                    }
                    else if (result[i].types[0] === 'hospital')
                    {
                        result[i].types = ['chambres'];
                    }

                    googleMapAPI.createMarker(result[i], 'hebergements');
                };
                handlers.initHandlers();
            }
        }
    }
})(jQuery);
