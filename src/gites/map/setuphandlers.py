# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""
import logging
from zope.interface import alsoProvides
from zope.i18n import translate
from plone.i18n.normalizer import idnormalizer

from gites.core.utils import createFolder, changeFolderView, publishObject
from gites.locales import GitesMessageFactory as _

from gites.map.browser.interfaces import ISearchMapFolder

logger = logging.getLogger('gites.map')
TRANSLATIONS = ['nl', 'en', 'it', 'de']


def setupMap(context):
    if context.readDataFile('gites.map_various.txt') is None:
        return
    logger.debug('Setup gites map')
    portal = context.getSite()
    mapFolder = createFolder(portal, "recherche-cartographique",
                             "Recherche cartographique", excludeNav=True)
    mapFolder.setLanguage('fr')
    changeFolderView(portal, mapFolder, 'mapSearchView')
    publishObject(mapFolder)
    translateMapFolder(portal, mapFolder)


def translateMapFolder(portal, baseObject):
    for lang in TRANSLATIONS:
        if not baseObject.hasTranslation(lang):
            title = translate(_(u"recherche_cartographique"),
                              target_language=lang)
            id = idnormalizer.normalize(title)
            translated = baseObject.addTranslation(lang, id=id, title=title)
            publishObject(translated)
            changeFolderView(portal, translated, 'mapSearchView')
