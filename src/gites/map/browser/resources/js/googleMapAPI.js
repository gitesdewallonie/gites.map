var googleMapAPI ={
    map : null,
    placeService : null,
    infowindow: null,
    //Wallonie center
    defaultCenter: new google.maps.LatLng(50.401078, 5.133648),
    defaultZoom: 10,
    zoomLimit: 10,
    lines: [],
    markers : {
        // From python
        primary : {
            map_package: [],
            gite: [],
            chambre: [],
            sport_loisir: [],
            attraction_musee: [],
            terroir: [],
            gare: [],
            information_touristique: [],
            evenement: [],
            restaurant: [],
        },
        // From google map
        secondary : {
            magasin: [],
            night: [],
            entertainment: [],
            casino: [],
            library: [],
            park: [],
            wellness: []}
    },
    subCategories: {
        transport: ['airport', 'bus_station'],
        magasin: ['book_store', 'shopping_mall', 'store', 'bakery', 'grocery_or_supermarket'],
        night: ['bar', 'cafe', 'night_club'],
        entertainment: ['amusement_park', 'aquarium', 'museum', 'zoo'],
        casino: ['casino'],
        library: ['library'],
        park: ['park'],
        wellness: ['wellness']
    },
    categoriesToHide: [
            'gare',
            'informationtouristique',
            'evenementquefaire',
            'transport',
            'magasin',
            'night',
            'entertainment',
            'casino',
            'library',
            'park',
            'wellness'
        ],

    overlay : null,
    overlayView : null,
    projection : null,

    initialize : function()
    {
        var mapInfos = services.getMapInfos();
        var zoom = (mapInfos.zoom !== null)?mapInfos.zoom:googleMapAPI.defaultZoom;

        if (mapInfos.center !== null)
        {
            var center = new google.maps.LatLng(mapInfos.center.latitude, mapInfos.center.longitude);
        }
        else
        {
            var center = googleMapAPI.defaultCenter;
        }

        this.map =  new google.maps.Map(jQuery('#map_div')[0], {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: center,
            zoom: zoom,
            minZoom: 8,
            panControl: false,
            keyboardShortcuts: false,
            streetViewControl: false,
            scaleControl: true,
            scaleControlOptions: {position: google.maps.ControlPosition.BOTTOM_LEFT},
            scrollwheel: false,
        });

        this.overlayView = new google.maps.OverlayView();
        this.overlayView.draw = googleMapAPI.updateLines;
        this.overlayView.setMap(this.map);

        this.placeService = new google.maps.places.PlacesService(this.map);

        //initialize infowindow
        this.infowindow = new google.maps.InfoWindow(
                {
                    size: new google.maps.Size(150,50)
                });

        this.overlay = new google.maps.Polygon();

        // Place polygon overlay
        this.overlay = new google.maps.Polygon({
            paths: [belgiumCoords.world,
            belgiumCoords.wallonie,
            belgiumCoords.comines],
            strokeColor: "",
            strokeOpacity: 0,
            strokeWeight: 0,
            fillColor: "",
            fillOpacity: 0.08
        });
        this.overlay.setMap(this.map);

        services.getPrimaryMarkers();

        giteMapHandlers.initHandlers();
    },

    updateProjection : function()
    {
        googleMapAPI.projection = googleMapAPI.overlayView.getProjection();
    },

    updateLines : function()
    {
        if (googleMapAPI.projection !== undefined && googleMapAPI.projection !== null)
        {
            for (var category in googleMapAPI.markers) {
                for (var type in googleMapAPI.markers[category]) {
                    var l = googleMapAPI.markers[category][type].length;
                    for (var i=0; i < l; i++) {
                        var marker = googleMapAPI.markers[category][type][i];
                        if (marker.offset)
                        {
                            // Add line to point offset images to real location
                            var AlatLong = marker.position;
                            var BrelativePoint = marker.offset;
                            var Apoint = googleMapAPI.projection.fromLatLngToContainerPixel(AlatLong);
                            var Bpoint = new google.maps.Point(Apoint.x + BrelativePoint.x, Apoint.y - BrelativePoint.y);
                            var BlatLong = googleMapAPI.projection.fromContainerPixelToLatLng(Bpoint);

                            var lineCoordinates = [
                                AlatLong,
                                BlatLong
                            ];
                            marker.line.setPath(lineCoordinates);
                        }
                    };
                }
            }
        }
    },

    createMarker : function(place, category)
    {
        // XXX ne pas creer un marker s il existe déjà dans googleMapAPI.markers !

        // Get the right type we want the marker to be added in
        if (category === 'secondary')
        {
            var type = undefined;
            var l = place.types.length;
            breakhere:
                for (var i=0; i < l; i++)
                {
                    for (var subCategory in googleMapAPI.subCategories)
                    {
                        var l2 = googleMapAPI.subCategories[subCategory].length;
                        for (var j=0; j < l2; j++)
                        {
                            if (place.types[i] === googleMapAPI.subCategories[subCategory][j])
                            {
                                type = subCategory;
                                break breakhere;
                            }
                        }

                    }
                }
        }
        else
        {
            type = place.types[0];
        }

        if (type === undefined)
        {
            // If no type found (must never append)
            return;
        }

        // Show number on the map
        var image = type;
        if ((type === 'gite' || type === 'chambre') && place.digit)
        {
            image = type + '_' + place.digit;
        }

        // window.portal_url added by plone

        var html;

        var location;

        // Coming from python
        if (place.latitude !== undefined)
        {
            html = place.name + "<br />" + place.vicinity;
            location = new google.maps.LatLng(place.latitude, place.longitude);
        }
        // It's a direct google map object
        else
        {
            html = "<b>" + place.name + "</b><br />" + place.vicinity;
            location = place.geometry.location;
        }


        // Offset image for grouped gites on map
        var anchor = null;
        var offset = null;
        if (place.offset !== null && place.offset !== undefined)
        {
            offset = new google.maps.Point(place.offset.x, place.offset.y);

            // Permet de pointer la location sur le dessous milieu de l'image
            imageWidth = 32;
            imageHeight = 37;
            // X par defaut fait aller l'image vers la gauche (par rapport à la location)
            // Y par defaut fait aller l'image vers le haut (par rapport à la location)
            anchor = new google.maps.Point(imageWidth/2 - place.offset.x, imageHeight + place.offset.y);
        }
        var icon = new google.maps.MarkerImage(
                window.portal_url + '/' + '++resource++gites.map.images/'+image+'.png',
                // size
                null,
                // origin
                null,
                // anchor
                anchor,
                // scaledsize
                null);

        var marker = new google.maps.Marker(
        {
            map : this.map,
            position : location,
            icon:icon
        });

        marker.offset = offset;
        marker.checked = true;

        // Add heb_pk on markers that need it
        if (place.heb_pk !== undefined)
        {
            marker.heb_pk = place.heb_pk;
            marker.heb_type = place.heb_type;
        }

        // Add listener for infowindow
        google.maps.event.addListener(marker, 'click', function() {
            googleMapAPI.infowindow.setContent(html);
            googleMapAPI.infowindow.open(googleMapAPI.map,marker);
        });

        // Initialize lines
        var line = new google.maps.Polyline({
                path: [],
                strokeColor: "rgb(0, 0, 0)",
                strokeOpacity: 1.0,
                strokeWeight: 1
            });
        marker.line = line;
        marker.line.setMap(googleMapAPI.map);

        googleMapAPI.markers[category][type].push(marker);

    },

    manageMarkersVisibility : function()
    {
        // Update visibility of all markers
        for (var category in this.markers){
            for (var type in this.markers[category]) {
                var l = this.markers[category][type].length;
                for (var i=0; i < l; i++) {
                    marker = this.markers[category][type][i];

                    // Hide or show secondary marker if checkbox checked/unchecked
                    //   or if dezoom to the limit
                    if (googleMapAPI.categoriesToHide.indexOf(type) != -1)
                    {
                        if (marker.checked && this.map.zoom > this.zoomLimit)
                        {
                            marker.setVisible(true);
                        }
                        else if (marker.checked && this.map.zoom <= this.zoomLimit)
                        {
                            marker.setVisible(false);
                        }
                        else
                        {
                            marker.setVisible(false);
                        }
                    }
                    // Hide or show markers if checkbox checked/unchecked
                    else
                    {
                        (marker.checked)?marker.setVisible(true):marker.setVisible(false);
                    }
                };
            }
        }
    },

    deleteMarkersByType : function(type, category)
    {
        // Hide given markers
        var l = googleMapAPI.markers[category][type].length;
        for (var i=0; i < l; i++) {
            googleMapAPI.markers[category][type][i].setVisible(false);
        }
        // Remove marker
        googleMapAPI.markers[category][type] = [];
    },

    manageCheckboxDisabling : function()
    {
        if (this.map.zoom > this.zoomLimit)
        // dégriser les checkbox qui doivent l etre
        {
            jQuery('input[name="map_category_box"]').each(function(index, checkBox)
                {
                    if (googleMapAPI.categoriesToHide.indexOf(checkBox.id) != -1)
                    {
                        checkBox.disabled = false;
                        label = jQuery("label[for=" + checkBox.id + "]");
                        label.removeClass("unzoomed_legend_label");
                    }
                });
            jQuery('#disable_legend_sentence').hide();
            jQuery('.disable_legend_label').css('font-weight', 'bold');
        }

        // griser les checkbox qui doivent l'etre si dezoom > limit
        else
        {
            jQuery('input[name="map_category_box"]').each(function(index, checkBox)
                {
                    if (googleMapAPI.categoriesToHide.indexOf(checkBox.id) != -1)
                    {
                        checkBox.disabled = true;
                        label = jQuery("label[for=" + checkBox.id + "]");
                        label.addClass("unzoomed_legend_label");
                    }
                });
            jQuery('#disable_legend_sentence').show();
            jQuery('.disable_legend_label').css('font-weight', 'normal');
        }
    },
    boundToAllMarkers : function()
    {
        var bounds = new google.maps.LatLngBounds();

        for (var category in this.markers) {
            for (var type in this.markers[category]) {
                var l = this.markers[category][type].length;
                for (var i=0; i < l; i++) {
                    marker = this.markers[category][type][i];
                    if (marker.checked)
                    {
                        bounds.extend(marker.getPosition());
                    }
                };
            }
        }

        if (!bounds.isEmpty())
        {
            // Don't zoom in too far on only one marker
            if (bounds.getNorthEast().equals(bounds.getSouthWest()))
            {
                var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
                var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
                bounds.extend(extendPoint1);
                bounds.extend(extendPoint2);
            }

            this.map.fitBounds(bounds);
        }
    },

    updateHebergementsMarkers : function(hebergements)
    {
        // Remove actual hebergements markers
        googleMapAPI.deleteMarkersByType('gite', 'primary');
        googleMapAPI.deleteMarkersByType('chambre', 'primary');

        // Add markers
        var l = hebergements.length;
        for (var i=0; i < l; i++) {
            googleMapAPI.createMarker(hebergements[i],
                                      'primary');
        };

        googleMapAPI.boundToAllMarkers();
    },

    updateSecondaryMarkers : function()
    {
        if (googleMapAPI.map.zoom > googleMapAPI.zoomLimit)
        {
            // Empty secondarymarkers
            for (var type in googleMapAPI.markers['secondary'])
            {
                googleMapAPI.deleteMarkersByType(type, 'secondary');
            }

            // Prepare secondary types that are checked on template
            var types = [];
            jQuery('input[name="map_category_box"]').each(function(index, checkBox)
            {
                if (checkBox.id in googleMapAPI.markers.secondary)
                {
                    if ( jQuery(checkBox).prop('checked') )
                    {
                        types.push(checkBox.value);
                    }
                }
            });

            // get secondarymarkers
            if (types !== [])
            {
                var l = types.length;
                for (var i=0; i < l; i++)
                {
                    services.getSecondaryMarkers(googleMapAPI.subCategories[types[i]]);
                }
            }
        }
    }

};
