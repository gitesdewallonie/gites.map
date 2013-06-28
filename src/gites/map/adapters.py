# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.component import queryMultiAdapter
from zope.interface import Interface
from Products.CMFPlone.Portal import PloneSite
from gites.db.content.commune import Commune
from gites.db.content.hebergement.hebergement import Hebergement
from gites.core.adapters.hebergementsfetcher import (BaseHebergementsFetcher,
                                                     PackageHebergementFetcher,
                                                     SearchHebFetcher,
                                                     CommuneHebFetcher)
from gites.core.interfaces import IMapRequest
from gites.core.content.interfaces import IPackage
from gites.map.interfaces import IHebergementsMapFetcher
from gites.map.browser.utils import hebergementToMapObject, packageToMapObject


ALLCHECKBOXES = ['gite',
                 'chambre',
                 'sport_loisir',
                 'attraction_musee',
                 'terroir',
                 'evenement',
                 'gare',
                 'information_touristique',
                 'restaurant',
                 'evenementquefaire',

                 'transport',
                 'magasin',
                 'night',
                 'entertainment',
                 'casino',
                 'library',
                 'park',
                 'wellness',
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

    def _calculateGroupedDigits(self, hebergements):
        groupedDigits = {}

        for heb in hebergements:
            groupedDigit = None
            group_pk = heb.heb_groupement_pk
            if group_pk:
                if group_pk in groupedDigits.keys():
                    groupedDigit = groupedDigits[group_pk] + 1
                else:
                    groupedDigit = 0
                groupedDigits[group_pk] = groupedDigit
        return groupedDigits

    def fetch(self):
        hebergements = []
        for heb in self():
            hebergements.append(heb)

        groupedDigits = self._calculateGroupedDigits(hebergements)

        groupedDigitsTmp = {}
        digit = 0
        mapObjects = []
        for heb in hebergements:
            groupedDigitTmp = None
            group_pk = heb.heb_groupement_pk
            # Allow to deactivate lines if only one heb in this group
            if group_pk in groupedDigits.keys() and groupedDigits[group_pk] != 0:
                if group_pk in groupedDigitsTmp.keys():
                    groupedDigitTmp = groupedDigitsTmp[group_pk] + 1
                else:
                    groupedDigitTmp = 0
                groupedDigitsTmp[group_pk] = groupedDigitTmp

            digit += 1
            mapObjects.append(
                hebergementToMapObject(
                    heb,
                    self.context,
                    self.request,
                    digit,
                    groupedDigitTmp))
        return mapObjects


class PackageHebergementFetcherWithMap(BaseMapFetcher, PackageHebergementFetcher):
    grok.adapts(IPackage, Interface, IMapRequest)
    grok.provides(IHebergementsMapFetcher)

    fetch = PackageHebergementFetcher.__call__

    def fetch(self):
        for obj in BaseMapFetcher.fetch(self):
            yield obj
        yield packageToMapObject(self.context)

    def mapInfos(self):
        return {'zoom': None,
                'center': None}

    def checkBoxes(self):
        return []

    def allMapDatas(self):
        return []


class HebergementsInCommuneContentFetcher(BaseMapFetcher, CommuneHebFetcher):
    grok.adapts(Commune, Interface, IMapRequest)


class SearchContentFetcher(BaseMapFetcher, SearchHebFetcher):
    grok.adapts(PloneSite, Interface, IMapRequest)

    def checkBoxes(self):
        return []


class HebergementsViewFetcher(BaseMapFetcher, BaseHebergementsFetcher):
    grok.adapts(Hebergement, Interface, IMapRequest)

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
        datas = []
        datas.extend(requestView.getMaisonsDuTourisme())
        datas.extend(requestView.getGares())
        datas.extend(requestView.getInfosTouristiques('sport_loisir', 4))
        datas.extend(requestView.getInfosTouristiques('attraction_musee', 5))
        datas.extend(requestView.getInfosTouristiques('terroir', 6))
        datas.extend(requestView.getInfosTouristiques('evenement', 7))
        datas.extend(requestView.getQuefaireEvents())
        datas.extend(requestView.getRestos())
        return datas
