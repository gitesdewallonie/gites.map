var handlers = {
    initHandlers : function()
    {
        jQuery('input[name="secondary_box"]').bind({'change':this.secondaryCheckboxHandler});
        jQuery('input[name="primary_box"]').bind({'change':this.primaryCheckboxHandler});
        jQuery('input#bound_button').bind({'click':this.boundHandler});
        google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler);
        // google.maps.event.addListener(googleMapAPI.map,'bounds_changed',this.boundsHandler);
        // google.maps.event.addListener(googleMapAPI.map,'idle',this.boundsHandler);

        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
    },

    secondaryCheckboxHandler: function(event)
    {
        if(googleMapAPI.secondaryMarkersExists(event.target.value))
        {
            var markersToManage = googleMapAPI.markers.secondary[event.target.value];
            var l = markersToManage.length;
            for (var i=0; i < l; i++) {
                markersToManage[i].checked = jQuery(this).prop('checked');
            };
        } else{
            services.getSecondaryMarkers([event.target.value]);
        }
        googleMapAPI.manageMarkersVisibility();
    },

    primaryCheckboxHandler: function(event)
    {
        var markersToManage = googleMapAPI.markers.primary[event.target.value];
        var l = markersToManage.length;
        for (var i=0; i < l; i++) {
            markersToManage[i].checked = jQuery(this).prop('checked');
        };
        googleMapAPI.manageMarkersVisibility();
    },

    zoomHandler : function(event)
    {
        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
    },

    boundHandler : function(event)
    {
        googleMapAPI.boundToAllMarkers();
    },
    boundsHandler : function(event)
    {
        //googleMapAPI.boundsChange();
    }
};
