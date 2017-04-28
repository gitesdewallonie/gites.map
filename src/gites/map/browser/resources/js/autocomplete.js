jQuery(document).ready(function($) {

    var countryRestrict = {'country': 'be'};
    var field = document.getElementById('nearto-autocomplete');
    var language = 'fr';   /*field.lang;*/
    autocomplete = new google.maps.places.Autocomplete(
      field,
      {
         types: ['geocode'],
         language: language,
         componentRestrictions: countryRestrict
       }
    );

});
