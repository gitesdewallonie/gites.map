# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.component import queryMultiAdapter
from zope.interface import Interface
from zope.publisher.interfaces.browser import IBrowserRequest
from gites.core.adapters.hebergementsfetcher import BaseHebergementsFetcher, PackageHebergementFetcher
from gites.core.content.interfaces import IPackage
from gites.map.interfaces import IHebergementsMapFetcher
from gites.map.browser.interfaces import IMappableView, IMappableContent
from gites.map.browser.utils import hebergementToMapObject


ALLCHECKBOXES = ['gite',
                 'chambre',
                 'infotouristique',
                 'infopratique',
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

    def fetch(self):
        return []

    def checkBoxes(self):
        return ALLCHECKBOXES

    def mapInfos(self):
        return {'zoom': None,
                'center': None,
                'boundToAll': False}

    def allMapDatas(self):
        return []


class PackageHebergementFetcherWithMap(BaseMapFetcher, PackageHebergementFetcher):
    grok.adapts(IPackage, Interface, IBrowserRequest)
    grok.provides(IHebergementsMapFetcher)

    fetch = PackageHebergementFetcher.__call__

    def fetch(self):
        digit = 0
        for heb in self():
            digit += 1
            yield hebergementToMapObject(hebergement=heb,
                                         context=self.context,
                                         request=self.request,
                                         digit=digit)

    def mapInfos(self):
        return {'zoom': None,
                'center': None}

    def checkBoxes(self):
        return []

    def allMapDatas(self):
        return []


class HebergementsContentFetcher(BaseMapFetcher, BaseHebergementsFetcher):
    grok.adapts(IMappableContent, Interface, IBrowserRequest)
    grok.provides(IHebergementsMapFetcher)

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
        location = self.context.heb_location

        maisons = requestView.getMaisonsDuTourisme(location)
        infosTour = requestView.getInfosTouristiques(location)
        infosPrat = requestView.getInfosPratiques(location)
        quefaireEvents = requestView.getQuefaireEvents(location)
        restos = requestView.getRestos(location)
        return maisons + infosPrat + infosTour + quefaireEvents + restos


class HebergementsViewFetcher(BaseMapFetcher, BaseHebergementsFetcher):
    grok.adapts(Interface, IMappableView, IBrowserRequest)
    grok.provides(IHebergementsMapFetcher)

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
        infosPrat = requestView.getInfosPratiques()
        infosTour = requestView.getInfosTouristiques()
        quefaireEvents = requestView.getQuefaireEvents()
        restos = requestView.getRestos()
        return maisons + infosPrat + infosTour + quefaireEvents + restos
