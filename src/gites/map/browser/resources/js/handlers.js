var giteMapHandlers = {
    initHandlers : function()
    {
        this._initExternalDigitMarkerHandlers();
        jQuery('input[name="map_category_box"]').bind({'change':this.categoryCheckboxHandler});
        jQuery('input#bound_button').bind({'click':this.boundHandler});
        google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler);
        google.maps.event.addListener(googleMapAPI.map,'dragend',this.dragHandler);

        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
    },

    // When we click on pictos outside of the map it show that one on the map
    _initExternalDigitMarkerHandlers: function()
    {
        var primaryMarkers = googleMapAPI.markers.primary;
        var lgite = primaryMarkers.gite.length;
        for (var i=0; i < lgite; i++)
        {
            giteMapHandlers._boundExternalDigitMarker(primaryMarkers.gite[i]);
        }
    },

    // Bound the external digit marker depending on map marker send
    _boundExternalDigitMarker: function(marker)
    {
        var selector = 'div#map_picto_' + marker.heb_pk;
        // Cause that div map_picto_... is loaded by javascript after the document is ready:
        var externalDigitMarker = jQuery(selector);
        externalDigitMarker.waitUntilExists(function(){
            jQuery(selector).click({'heb_pk': marker.heb_pk}, giteMapHandlers.clickedMarkerHandler);
        });
    },

    clickedMarkerHandler: function(event)
    {
        var primaryMarkers = googleMapAPI.markers.primary;
        var lgite = primaryMarkers.gite.length;
        for (var i=0; i < lgite; i++)
        {
            if (primaryMarkers.gite[i].heb_pk === event.data.heb_pk)
            {
                new google.maps.event.trigger(primaryMarkers.gite[i], 'click');
            }
        }
    },

    categoryCheckboxHandler: function(event)
    {
        // primary
        if (this.id in googleMapAPI.markers.primary)
        {
            var markersToManage = googleMapAPI.markers.primary[event.target.value];
            var l = markersToManage.length;
            for (var i=0; i < l; i++) {
                markersToManage[i].checked = jQuery(this).prop('checked');
            }
            googleMapAPI.manageMarkersVisibility();
        }

        // secondary
        else
        {
            var type = event.target.value;

            // Check the checkbox
            if ( jQuery(this).prop('checked') )
            {
                // Look at informations from google
                services.getSecondaryMarkers(googleMapAPI.subCategories[type]);
            }

            // Uncheck the checkbox
            else
            {
                var markersToManage = googleMapAPI.markers.secondary[type];
                var l = markersToManage.length;
                for (var i=0; i < l; i++) {
                    markersToManage[i].checked = false;
                };
                googleMapAPI.deleteMarkersByType(type, 'secondary');
            }
        }
    },

    primaryCheckboxHandler: function(event)
    {
    },

    zoomHandler : function(event)
    {
        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
        googleMapAPI.updateSecondaryMarkers();
    },

    boundHandler : function(event)
    {
        googleMapAPI.boundToAllMarkers();
    },

    dragHandler : function(event)
    {
        googleMapAPI.updateSecondaryMarkers();
    }
};
