.. contents::

Introduction
============

Must implements IMappableView or IMappableContent to see the map

See adapters.py for specific code and types

Todo
====

+ Creer viewlet map

+ Inverser les lat/long dans la db qui sont actuellement inversés justement pour tous les types d objets geolocalisés

+ Autobound
+ Récupérer les autres infos touristiques
    + mettre au propre les couches (infos sont dans hebergement actuellement
                                    alors que ce n'est pas ca)
+ Appelable sur une vue
+ i18n (dans gites.skin)
+ Creer des icones
+ Terminer le masque wallon
+ Corriger les coordonnées

- Recupérer les autres infos externes
    + creer table pour stocker les infos necessaire pour les providers externes
    - creer scripts quefaire.be (goto gites.webservice)
        + replication
        - update
    - resto.be

+ Blocker les informations blacklistées sur la map
    + Google
    + Resto (getRestos utils.py)
    + Quefaire (getQuefaireEvents utils.py)

+ Afficher les informations venant de la table map_external_data (utils.py)
    + Resto
    + Quefaire

+ Mettre à jour les colonnes _location par cron
    + heb_location
    + infotour_location
    + infoprat_location
    + mais_location
    + ext_data_location

- Afficher données par rapport distance point d'interet
    - Resto
        + Ajouter colonne location dans map_external_data table ext_data_location
    - Quefaire
        + Ajouter colonne location dans map_external_data table ext_data_location
    - infopratique
    - infotouristique
    - maisontourisme
