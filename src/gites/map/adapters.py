# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.component import queryMultiAdapter
from zope.interface import Interface
from zope.publisher.interfaces.browser import IBrowserRequest
from Products.CMFPlone.Portal import PloneSite
from gites.db.content.commune import Commune
from gites.db.content.hebergement.hebergement import Hebergement
from gites.core.adapters.hebergementsfetcher import (BaseHebergementsFetcher,
                                                     PackageHebergementFetcher,
                                                     SearchHebFetcher,
                                                     CommuneHebFetcher)
from gites.core.content.interfaces import IPackage
from gites.map.interfaces import IHebergementsMapFetcher
from gites.map.browser.utils import hebergementToMapObject, packageToMapObject


ALLCHECKBOXES = ['gite',
                 'chambre',
                 'infotouristique',
                 'gare',
                 'maisontourisme',
                 'restaurant',
                 'evenementquefaire',

                 'transport',
                 'culte',
                 'commerce',
                 'night',
                 'entertainment',
                 'city_hall',
                 'art_gallery',
                 'casino',
                 'library',
                 'park',
                 'spa',
                 ]


class BaseMapFetcher:
    grok.provides(IHebergementsMapFetcher)

    def checkBoxes(self):
        return ALLCHECKBOXES

    def mapInfos(self):
        return {'zoom': None,
                'center': None,
                'boundToAll': False}

    def allMapDatas(self):
        return []

    def fetch(self):
        digit = 0
        for heb in self():
            digit += 1
            yield hebergementToMapObject(heb, self.context, self.request,
                                         digit)


class PackageHebergementFetcherWithMap(BaseMapFetcher, PackageHebergementFetcher):
    grok.adapts(IPackage, Interface, IBrowserRequest)
    grok.provides(IHebergementsMapFetcher)

    fetch = PackageHebergementFetcher.__call__

    def fetch(self):
        for heb in self():
            yield hebergementToMapObject(hebergement=heb,
                                         context=self.context,
                                         request=self.request)
        yield packageToMapObject(self.context)

    def mapInfos(self):
        return {'zoom': None,
                'center': None}

    def checkBoxes(self):
        return []

    def allMapDatas(self):
        return []


class HebergementsInCommuneContentFetcher(BaseMapFetcher, CommuneHebFetcher):
    grok.adapts(Commune, Interface, IBrowserRequest)


class SearchContentFetcher(BaseMapFetcher, SearchHebFetcher):
    grok.adapts(PloneSite, Interface, IBrowserRequest)


class HebergementsViewFetcher(BaseMapFetcher, BaseHebergementsFetcher):
    grok.adapts(Hebergement, Interface, IBrowserRequest)

    def fetch(self):
        heb = hebergementToMapObject(hebergement=self.context,
                                     context=self.context,
                                     request=self.request)
        return [heb]

    def checkBoxes(self):
        checkboxes = ALLCHECKBOXES[:]
        checkboxes.remove('gite')
        checkboxes.remove('chambre')
        return checkboxes

    def mapInfos(self):
        return {'zoom': 14,
                'center': {'latitude': self.context.heb_gps_lat,
                           'longitude': self.context.heb_gps_long},
                'boundToAll': False}

    def allMapDatas(self):
        requestView = queryMultiAdapter((self.context, self.request),
                                        name="utilsView")
        maisons = requestView.getMaisonsDuTourisme()
        infosPrat = requestView.getGares()
        infosTour = requestView.getInfosTouristiques()
        quefaireEvents = requestView.getQuefaireEvents()
        restos = requestView.getRestos()
        return maisons + infosPrat + infosTour + quefaireEvents + restos
