# -*- coding: utf-8 -*-
import grokcore.component as grok
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

    def __call__(self):
        # XXX code that fetches hebergements from content
        return []


class HebergementsViewFetcher(BaseHebergementsFetcher):
    grok.adapts(Interface, IMappableView, IBrowserRequest)

    def fetch(self):
        # XXX code that fetches hebergements from view
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
        # XXX we need to invert lat and long for now !!!
        return {'zoom': 14,
                'center': {'latitude': self.context.heb_gps_long,
                           'longitude': self.context.heb_gps_lat}}
