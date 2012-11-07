(function($)
{
	$(document).ready(function() {
		googleMapAPI.initialise();
		
	});
	
	var handlers = {
		initHandlers : function()
		{
			$('input[name="type_box"]').bind({'change':this.checkboxHandler});
			google.maps.event.addListener(googleMapAPI.map,'zoom_changed',this.zoomHandler)
		},
		checkboxHandler: function(event)
		{
			if(googleMapAPI.checkMarkersExists(event.target.value))
			{
				var markersToManage =googleMapAPI.markers[event.target.value];
				var l = markersToManage.length;
				for (var i=0; i < l; i++) {
					markersToManage[i].setVisible($(this).prop('checked'));
				};
			} else{
				services.getPoints([event.target.value]);
			}
		},
		zoomHandler : function(event)
		{
			(this.zoom<9)?googleMapAPI.manageMarkersVisibility(false):googleMapAPI.manageMarkersVisibility(true);
		}
		
	}
	var googleMapAPI ={
	 	map:null,
		markers:{},
		 initialise : function()
		 {
			 this.map =  new google.maps.Map($('#map_div')[0], {
      		   				mapTypeId: google.maps.MapTypeId.ROADMAP,
							center:new google.maps.LatLng(50.417,4.450) ,
							zoom: 10
    					});
			services.getPoints(['restaurant']);
		 },
		 createMarker : function(place)
		 {	 
			 var type = place.types[0];
			 var icon = new google.maps.MarkerImage('images/icones/'+type+'.png');
			 var marker = new google.maps.Marker(
				 {
					 map : this.map,
					 position : place.geometry.location,
					 icon:icon
				 }
			 );
			googleMapAPI.markers[type].push(marker);
		 },
		 checkMarkersExists: function(nameMarker)
		 {
			return (this.markers[nameMarker] != undefined)?true:false;
		 },
		 manageMarkersVisibility : function(isVisible)
		 {
			for (var key in this.markers) {
				var l = this.markers[key].length;
				for (var i=0; i < l; i++) {
					this.markers[key][i].setVisible(isVisible);
				};
			}
			
		 }
		 
	};
	var services = {
		getPoints : function(types)
		{
			var l = types.length;
			for (var i=0; i < l; i++) {
				googleMapAPI.markers[types[i]]=[];
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
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var l = result.length;
				for (var i=0; i < l; i++) {
					googleMapAPI.createMarker(result[i]);
				};
				handlers.initHandlers();
			}
		}
	}
	
})(jQuery);