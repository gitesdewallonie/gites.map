# -*- coding: utf-8 -*-
from zope.interface import Interface


class IHebergementsMapFetcher(Interface):

    def fetch():
        pass

    def checkboxes():
        pass

    def mapInfos():
        pass

    def allMapDatas():
        pass
