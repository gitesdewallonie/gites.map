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
        if (status === google.maps.places.PlacesServiceStatus.OK) {
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

                googleMapAPI.createMarker(result[i], 'hebergements');
            };
            handlers.initHandlers();
        }
    }
};