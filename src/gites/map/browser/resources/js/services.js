var services = {
    getSecondaryMarkers : function(types)
    {
        // infosJSON coming from the template (python)
        var l = types.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.markers.secondary[types[i]]=[];


            var l = infosJSON.length;
            for (var j=0; j < l; j++) {
                if (infosJSON[j].types[0] === types[i])
                {
                    googleMapAPI.createMarker(infosJSON[j],
                                              'secondary');
                }
            };

            var request = {
                location: googleMapAPI.wallonieCenter,
                radius: 5000,
                types: [types[i]]
            };
            var service = new google.maps.places.PlacesService(googleMapAPI.map);
            service.nearbySearch(request, services.callBack_getSecondaryMarkers);
        };

    },

    callBack_getSecondaryMarkers : function(result,status)
    {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var l = result.length;
            for (var i=0; i < l; i++) {
                googleMapAPI.createMarker(result[i], 'secondary');
            };
        }
    },

    getPrimaryMarkers : function() //Temporary creating fake gites
    {
        // hebergementsJSON coming from the template (python)
        var l = hebergementsJSON.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.createMarker(hebergementsJSON[i],
                                      'primary');
        };
        var l = infosJSON.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.createMarker(infosJSON[i],
                                      'primary');
        };
    },

    callBack_getPrimaryMarkers : function(result,status)
    {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
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

                googleMapAPI.createMarker(result[i], 'primary');
            };
        }
    }
};
