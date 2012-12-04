# -*- coding: utf-8 -*-
from zope.interface import Interface
from plone.theme.interfaces import IDefaultPloneLayer


class IGitesMap(IDefaultPloneLayer):
    """
    Marker interface that defines a Zope 3 browser layer.
    """


class IMappableContent(Interface):
    """
    Marker interface for content types that contain hebergements to show them
    on the map
    """
