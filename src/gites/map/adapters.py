# -*- coding: utf-8 -*-
from zope.interface import Interface, implements


class IHebergementsFetcher(Interface):
    """
    Interface to fetch context/view related hebergements
    """


class HebergementsContentFetcher:
    implements(IHebergementsFetcher)

    def __init__(self, context, view, request):
        self.context = context
        self.view = view
        self.request = request

    def __call__(self):
        # XXX code that fetches hebergements from content
        return []


class HebergementsViewFetcher:
    implements(IHebergementsFetcher)

    def __init__(self, context, view, request):
        self.context = context
        self.view = view
        self.request = request

    def __call__(self):
        # XXX code that fetches hebergements from view
        return []
