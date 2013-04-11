var services = {
    getSecondaryMarkers : function(types)
    {
        var l = types.length;
        var service = googleMapAPI.placeService;
        for (var i=0; i < l; i++) {

            var request = {
                // location: googleMapAPI.map.center,
                // radius: 10000,
                // rankBy: google.maps.places.RankBy.DISTANCE,
                bounds: googleMapAPI.map.getBounds(),
                types: [types[i]],
            };
            service.nearbySearch(request, services.callBack_getSecondaryMarkers);
        };

    },

    callBack_getSecondaryMarkers : function(result,status)
    {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var l = result.length;
            for (var i=0; i < l; i++) {
                // Check if blacklisted, googleBlacklistJSON coming from python
                if (jQuery.inArray(result[i].id, googleBlacklistJSON) == -1)
                {
                    googleMapAPI.createMarker(result[i], 'secondary');
                }
            };
        }
    },

    getPrimaryMarkers : function()
    {
        // hebergementsJSON coming from the template (python)
        var l = hebergementsJSON.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.createMarker(hebergementsJSON[i],
                                      'primary');
        };
        // infosJSON coming from the template (python)
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
