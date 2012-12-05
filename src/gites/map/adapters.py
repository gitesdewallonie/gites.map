# -*- coding: utf-8 -*-
from zope.interface import Interface, implements


class IHebergementsFetcher(Interface):
    """
    Interface to fetch context/view related hebergements
    """


class HebergementsFetcher:
    implements(IHebergementsFetcher)

    def __init__(self, context):
        self.context = context

    def __call__(self):
        # self.context
        return []
