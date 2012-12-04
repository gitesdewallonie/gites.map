# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl

$Id: viewlets.py 4587 2012-12-04 schminitz
"""

from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from plone.app.layout.viewlets.common import ViewletBase


class GitesMapViewlet(ViewletBase):
    render = ViewPageTemplateFile('templates/hebergements_map.pt')
