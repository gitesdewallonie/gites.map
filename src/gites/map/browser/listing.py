# -*- coding: utf-8 -*-
from five import grok
from zope.interface import alsoProvides, implements, Interface
from gites.core.interfaces import IMapRequest
from gites.map.browser.viewlets import GitesMapBase


class MapListing(GitesMapBase, grok.View):
    implements(Interface)
    grok.context(Interface)
    grok.name('update_map_listing')

    def __init__(self, context, request):
        grok.View.__init__(self, context, request)
        self.view = self

    def render(self):
        alsoProvides(self.request, IMapRequest)
        self.request.environ['plone.transformchain.disable'] = True
        return self.getHebergements()
