# -*- coding: utf-8 -*-
from five import grok
from zope.interface import implements
from gites.core.content.interfaces import IPackage
from gites.core.browser.interfaces import IPackageView
from gites.map.browser.viewlets import GitesMapViewlet


class MapListing(GitesMapViewlet, grok.View):
    implements(IPackageView)
    grok.context(IPackage)
    grok.name('update_map_listing')

    def __init__(self, context, request):
        grok.View.__init__(self, context, request)
        self.view = self

    def render(self):
        self.request.environ['plone.transformchain.disable'] = True
        return self.getHebergements()
