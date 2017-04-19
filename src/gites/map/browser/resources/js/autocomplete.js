jQuery(document).ready(function($) {

    var countryRestrict = {'country': 'be'};
    var field = document.getElementById('form-widgets-nearTo');
    var language = field.lang;
    autocomplete = new google.maps.places.Autocomplete(
      field,
      {
         types: ['geocode'],
         language: language,
         componentRestrictions: countryRestrict
       }
    );

});
