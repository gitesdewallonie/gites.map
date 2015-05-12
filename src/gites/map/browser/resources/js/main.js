(function($)
{
    $(document).ready(function() {
        var result = googleMapAPI.initialize();
        var map = result.map;
        var center = result.center;
        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
        });
    });
})(jQuery);
