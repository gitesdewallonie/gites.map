# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl

$Id: viewlets.py 4587 2012-12-04 schminitz
"""

from z3c.json.interfaces import IJSONWriter
from zope.component import getUtility, queryMultiAdapter
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from gites.core.interfaces import IHebergementsFetcher


class GitesMapViewlet(ViewletBase):
    render = ViewPageTemplateFile('templates/hebergements_map.pt')

    def available(self):
        requestView = queryMultiAdapter((self.context, self.request),
                                        name="utilsView")
        return requestView.shouldShowMapViewlet(view=self.view)

    def _makeJSON(self, obj):
        writer = getUtility(IJSONWriter)
        return writer.write(obj)

    def getHebergements(self):
        fetcher = queryMultiAdapter((self.context, self.view, self.request),
                                    IHebergementsFetcher)
        if fetcher is None:
            return self._makeJSON([])
        localHebergements = list(fetcher.fetch())
        if localHebergements:
            return self._makeJSON(localHebergements)
        else:
            # XXX temporary
            return self.getAllHebergements()

    def getCheckboxes(self):
        """
        get list of checkbox id that have to be showned here
        """
        fetcher = queryMultiAdapter((self.context, self.view, self.request),
                                    IHebergementsFetcher)
        checkBoxes = fetcher.checkBoxes()
        return checkBoxes

    def getMapInfos(self):
        """
        get info of default zoom and map center depending on context
        """
        fetcher = queryMultiAdapter((self.context, self.view, self.request),
                                    IHebergementsFetcher)
        mapInfos = fetcher.mapInfos()
        return self._makeJSON(mapInfos)

    def getAllHebergements(self):
        """
        Returns all hebs that can be shown on map
        """
        requestView = queryMultiAdapter((self.context, self.request),
                                        name="utilsView")
        results = requestView.getAllHebergements()
        return self._makeJSON(results)

    def getAllMapData(self):
        """
        Returns all "other" map data for the map
        """
        requestView = queryMultiAdapter((self.context, self.request),
                                        name="utilsView")
        maisons = requestView.getMaisonsDuTourisme()
        infosPrat = requestView.getInfosPratiques()
        infosTour = requestView.getInfosTouristiques()
        quefaireEvents = requestView.getQuefaireEvents()
        restos = requestView.getRestos()
        return self._makeJSON(maisons + infosPrat + infosTour + quefaireEvents + restos)
