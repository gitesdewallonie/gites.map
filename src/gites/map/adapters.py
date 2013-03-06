# -*- coding: utf-8 -*-
import grokcore.component as grok
from zope.interface import Interface
from zope.publisher.interfaces.browser import IBrowserRequest
from Products.CMFCore.interfaces import IContentish
from gites.map.browser.interfaces import IMappableView, IMappableContent
from gites.core.adapters.hebergementsfetcher import BaseHebergementsFetcher


class HebergementsContentFetcher(BaseHebergementsFetcher):
    grok.adapts(IMappableContent, Interface, IBrowserRequest)

    def __call__(self):
        # XXX code that fetches hebergements from content
        return []


class HebergementsViewFetcher(BaseHebergementsFetcher):
    grok.adapts(IContentish, IMappableView, IBrowserRequest)

    def __call__(self):
        # XXX code that fetches hebergements from view
        return []
