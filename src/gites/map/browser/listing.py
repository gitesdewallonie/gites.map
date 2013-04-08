# -*- coding: utf-8 -*-
from five import grok
from zope.interface import implements, Interface
from gites.map.browser.viewlets import GitesMapViewlet


class MapListing(GitesMapViewlet, grok.View):
    implements(Interface)
    grok.context(Interface)
    grok.name('update_map_listing')

    def __init__(self, context, request):
        grok.View.__init__(self, context, request)
        self.view = self

    def render(self):
        self.request.environ['plone.transformchain.disable'] = True
        return self.getHebergements()
