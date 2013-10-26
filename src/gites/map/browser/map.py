# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""

from sqlalchemy import select
from z3c.sqlalchemy import getSAWrapper
from zope.component import getMultiAdapter
from zope.interface import alsoProvides

from Products.Five import BrowserView

from gites.core.interfaces import IMapRequest

from gites.map.interfaces import IHebergementsMapFetcher
from gites.map.browser.utils import makeJSON
from gites.map.browser.interfaces import ISearchMapRequest


class GitesMapBase(object):

    @property
    def _fetcher(self):
        return getMultiAdapter((self.context, self.view, self.request),
                               IHebergementsMapFetcher)

    def getHebergements(self):
        localHebergements = list(self._fetcher.fetch())
        return makeJSON(localHebergements)


class GitesMapCommon(object):

    def getCheckboxes(self):
        """
        get list of checkbox id that have to be showned here
        """
        checkBoxes = self._fetcher.checkBoxes()
        return checkBoxes

    def getGoogleBlacklist(self):
        """
        get list of google blacklisted items so javascript can check on it
        """
        wrapper = getSAWrapper('gites_wallons')
        MapBlacklist = wrapper.getMapper('map_blacklist')
        query = select([MapBlacklist.blacklist_id],
                       MapBlacklist.blacklist_provider_pk == 'google')
        googleBlacklist = [result.blacklist_id for result in query.execute().fetchall()]
        return makeJSON(googleBlacklist)

    def getMapInfos(self):
        """
        get info of default zoom and map center depending on context
        """
        mapInfos = self._fetcher.mapInfos()
        return makeJSON(mapInfos)

    def getAllHebergements(self):
        """
        Returns all hebs that can be shown on map
        """
        requestView = getMultiAdapter((self.context, self.request),
                                      name="utilsView")
        results = requestView.getAllHebergements()
        return makeJSON(results)

    def getAllMapData(self):
        """
        Returns all "other" map data for the map
        """
        allMapDatas = self._fetcher.allMapDatas()
        return makeJSON(allMapDatas)


class MapSearch(BrowserView, GitesMapBase, GitesMapCommon):

    def __init__(self, context, request):
        super(MapSearch, self).__init__(context, request)
        alsoProvides(self.request, IMapRequest)
        alsoProvides(self.request, ISearchMapRequest)
