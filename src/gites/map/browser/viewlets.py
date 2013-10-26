# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl

$Id: viewlets.py 4587 2012-12-04 schminitz
"""

import zope.interface
from five import grok
from zope.component import getMultiAdapter
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from gites.core.viewlets.map import MapViewletManager
from gites.map.browser.map import GitesMapBase, GitesMapCommon


class GitesMapViewlet(GitesMapBase, GitesMapCommon, grok.Viewlet):
    render = ViewPageTemplateFile('templates/hebergements_map.pt')
    grok.viewletmanager(MapViewletManager)
    grok.context(zope.interface.Interface)
    grok.name('gites.map.hebergements')

    def available(self):
        requestView = getMultiAdapter((self.context, self.request),
                                      name="utilsView")
        return requestView.shouldShowMapViewlet(view=self.view)
