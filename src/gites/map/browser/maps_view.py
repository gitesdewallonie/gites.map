# -*- coding: utf-8 -*-
from zope.component import getMultiAdapter
from plone.memoize.instance import memoize
from Products.Maps.browser.map import DefaultMapView
from monet.mapsviewlet.browser.maps_view import MapsView as BaseMapsView
from monet.mapsviewlet.interfaces import IMonetMapsEnabledContent


class MapsView(BaseMapsView):

    @memoize
    def canShowMap(self):
        """Return true if we are in the edit view of the content"""
        context = self.context
        context_state = getMultiAdapter((context, self.request), name=u'plone_context_state')
        isViewTemplate = context_state.is_view_template()
        return not isViewTemplate and IMonetMapsEnabledContent.providedBy(context)


class MonetMapView(DefaultMapView):

    @property
    def enabled(self):
        if self.map is None:
            return False
        context = self.context
        context_state = getMultiAdapter((context, self.request), name=u'plone_context_state')
        isViewTemplate = context_state.is_view_template()
        return isViewTemplate is False
