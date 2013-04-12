jQuery(document).ready(function($) {

    var geocoder = new google.maps.Geocoder();

    var geocode_autocomplete = function(obj){
            $(this).autocomplete({
                source: function(request, response) {
                  var sw = new google.maps.LatLng(49.439557, 2.103882);
                  var ne = new google.maps.LatLng(51.110420, 6.256714);
                  var bounds = new google.maps.LatLngBounds(sw, ne);
                  var address = request.term;
                  address += ', ' + obj.country;  // since bounds and region are not
                                              // restrictive, we have to add country
                                              // manually
                  geocoder.geocode({address: address, bounds: bounds, region: 'be', language: obj.lang},
                                   function(results, status) {
                    response($.map(results, function(item) {
                        value = item.address_components[0].long_name;
                      return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                        location: item.geometry.location,
                        addr: item.address_components[0]
                      }
                    }));
                  })
                },
                minLength: 2
              });
            };

    $('.geocode_autocomplete_fr').live('focus', {'lang': 'fr', 'country': 'Belgique'}, geocode_autocomplete);
    $('.geocode_autocomplete_en').live('focus', {'lang': 'en', 'country': 'Belgium'}, geocode_autocomplete);
    $('.geocode_autocomplete_nl').live('focus', {'lang': 'nl', 'country': 'Belgïe'}, geocode_autocomplete);
    $('.geocode_autocomplete_de').live('focus', {'lang': 'de', 'country': 'Belgien'}, geocode_autocomplete);
    $('.geocode_autocomplete_it').live('focus', {'lang': 'it', 'country': 'Belgica'}, geocode_autocomplete);

});
