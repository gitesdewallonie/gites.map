.. contents::

Introduction
============

Must implements IMappableView or IMappableContent to see the map

See adapters.py for specific code and types

Todo
====

- Creer viewlet map
    + configure
    + profile defini que c est un viewlet
        + virer datepicker de gites.calendar car bug sur patch
    - view

+ Inverser les lat/long dans la db qui sont actuellement inversés justement pour tous les types d objets geolocalisés

+ Autobound
+ Récupérer les autres infos touristiques
    + mettre au propre les couches (infos sont dans hebergement actuellement
                                    alors que ce n'est pas ca)
+ Appelable sur une vue
+ i18n (dans gites.skin)
+ Creer des icones
+ Terminer le masque wallon

- Recupérer les autres infos externes

- Corriger les coordonnées

Infos GPS à corriger:
    (infos: latitude = distance par rapport a l equateur, longitude = distance par rapport au meridien de greenwich
    - Gite Le Pressoir (1966) a comme coordonnées: lat: 50.5134496 lon: 50.5134496
    - Infopratique neufchateau (226) a comme coordonnées: lat: 49.854133 lon: 49.854133
    - Infotouristique brasserie millevertu breuvane (245) lat: 48.0901966 lon: 5.6078668

    Hebergement qui n'ont pas de données gps:
        pk   | Nom
        2055 |
        2028 | Gîte entre Bois et Rivière
        2131 | So Les Montys - Rubis
        2134 | So Les Montis - Amethyste
        2126 | So Les Montys - Rubis
        2127 | So Les Montys - Rubis
        2128 | So Les Montys - Rubis
        2066 |
        2067 |
        2052 | Moulin de Saint-Vaast
        1970 | Gîte Haras de l'Orneau

    Info touristique qui n'a pas de données gps:
        Brasserie Saint-Monon (232)
