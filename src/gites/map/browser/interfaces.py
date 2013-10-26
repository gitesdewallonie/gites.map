# -*- coding: utf-8 -*-
from zope.interface import Interface
from plone.theme.interfaces import IDefaultPloneLayer

from gites.core.interfaces import IMapRequest


class IGitesMap(IDefaultPloneLayer):
    """
    Marker interface that defines a Zope 3 browser layer.
    """


class IMappableView(Interface):
    """
    Marker interface for views that contain hebergements to show them
    on the map
    """


class IMappableContent(Interface):
    """
    Marker interface for contents that contain hebergements to show them
    on the map
    """


class ISearchMapFolder(Interface):
    """
    Marker interface for map search folder
    """


class ISearchMapRequest(IMapRequest):
    """
    Marker interface for map search request
    """
