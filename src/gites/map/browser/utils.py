# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""

from Acquisition import aq_inner
from Products.Five import BrowserView
from plone.memoize.instance import memoize

from gites.map.browser.interfaces import IMappableContent


class UtilsView(BrowserView):
    """
    """

    @memoize
    def shouldShowMapViewlet(self):
        obj = aq_inner(self.context)
        return IMappableContent.providedBy(obj)
