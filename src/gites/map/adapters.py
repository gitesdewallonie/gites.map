# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.interface import Interface
from zope.publisher.interfaces.browser import IBrowserRequest
from gites.core.adapters.hebergementsfetcher import BaseHebergementsFetcher, PackageHebergementFetcher
from gites.core.content.interfaces import IPackage
from gites.core.browser.interfaces import IPackageView
from gites.map.browser.interfaces import IMappableView, IMappableContent
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


class PackageHebergementFetcherWithMap(PackageHebergementFetcher):
    grok.adapts(IPackage, IPackageView, IBrowserRequest)

    fetch = PackageHebergementFetcher.__call__

    def fetch(self):
        for heb in self():
            yield hebergementToMapObject(hebergement=heb,
                                         context=self.context,
                                         request=self.request)

    def mapInfos(self):
        return {'zoom': None,
                'center': None}

    def checkBoxes(self):
        return []


class HebergementsContentFetcher(BaseHebergementsFetcher):
    grok.adapts(IMappableContent, Interface, IBrowserRequest)

    def fetch(self):
        # XXX code that fetches hebergements from content
        return []

    def mapInfos(self):
        return {'zoom': None,
                'center': None}

    def checkBoxes(self):
        return ALLCHECKBOXES


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
                           'longitude': self.context.heb_gps_long}}
