# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.component import queryMultiAdapter
from zope.interface import Interface
from zope.publisher.interfaces.browser import IBrowserRequest
from gites.map.browser.interfaces import IMappableView, IMappableContent
from gites.core.adapters.hebergementsfetcher import BaseHebergementsFetcher
from gites.map.browser.utils import hebergementToMapObject


ALLCHECKBOXES = ['gites',
                 'chambres',
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


class HebergementsContentFetcher(BaseHebergementsFetcher):
    grok.adapts(IMappableContent, Interface, IBrowserRequest)

    def fetch(self):
        # XXX code that fetches hebergements from content
        return []

    def mapInfos(self):
        return {'zoom': None,
                'center': None,
                'boundToAll': False}

    def checkBoxes(self):
        return ALLCHECKBOXES

    def allMapDatas(self):
        return []


class HebergementsViewFetcher(BaseHebergementsFetcher):
    grok.adapts(Interface, IMappableView, IBrowserRequest)

    def fetch(self):
        heb = hebergementToMapObject(hebergement=self.context,
                                     context=self.context,
                                     request=self.request)
        return [heb]

    def checkBoxes(self):
        checkboxes = ALLCHECKBOXES[:]
        checkboxes.remove('gites')
        checkboxes.remove('chambres')
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
