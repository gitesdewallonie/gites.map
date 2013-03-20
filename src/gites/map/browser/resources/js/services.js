var services = {
    getSecondaryMarkers : function(types)
    {
        // XXX gerer le batch google

        // infosJSON coming from the template (python)
        var l = types.length;
        for (var i=0; i < l; i++) {

            var request = {
//                location: googleMapAPI.map.center,
//                radius: 10000,
//                rankBy: google.maps.places.RankBy.DISTANCE,
                bounds: googleMapAPI.map.getBounds(),
                types: [types[i]],
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
    },

    getMapInfos : function() //Get default zoom level depending on context
    {
        // mapInfosJSON coming from the template (python)
        return mapInfosJSON;
    }

};
