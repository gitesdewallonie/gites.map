var handlers = {
    initHandlers : function()
    {
        jQuery('input[name="map_category_box"]').bind({'change':this.categoryCheckboxHandler});
        jQuery('input#bound_button').bind({'click':this.boundHandler});
        google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler);
        google.maps.event.addListener(googleMapAPI.map,'dragend',this.dragHandler);

        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
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
