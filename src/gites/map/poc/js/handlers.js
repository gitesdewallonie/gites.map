var handlers = {
    initHandlers : function()
    {
        $('input[name="point_box"]').bind({'change':this.pointCheckboxHandler});
        $('input[name="hebergement_box"]').bind({'change':this.hebergementCheckboxHandler});
        $('input#bound_button').bind({'click':this.boundHandler});
        google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler);
        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
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
        googleMapAPI.manageMarkersVisibility();
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
        googleMapAPI.manageMarkersVisibility();
        googleMapAPI.manageCheckboxDisabling();
    },

    boundHandler : function(event)
    {
        googleMapAPI.boundToAllMarkers();
    }
};
