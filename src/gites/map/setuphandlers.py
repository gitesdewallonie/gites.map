# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""
import logging
from zope.interface import alsoProvides

from gites.core.utils import createFolder, changeFolderView

from gites.map.browser.interfaces import ISearchMapFolder

logger = logging.getLogger('gites.map')


def setupMap(context):
    if context.readDataFile('gites.map_various.txt') is None:
        return
    logger.debug('Setup gites map')
    portal = context.getSite()
    mapFolder = createFolder(portal, "recherche-cartographique",
                             "Recherche Cartographique", excludeNav=True)
    changeFolderView(portal, mapFolder, 'map-search')
    alsoProvides(ISearchMapFolder)
