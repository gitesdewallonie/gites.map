# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl

$Id: viewlets.py 4587 2012-12-04 schminitz
"""

from z3c.json.interfaces import IJSONWriter
from z3c.sqlalchemy import getSAWrapper
from zope.component import getUtility
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from plone.app.layout.viewlets.common import ViewletBase


class GitesMapViewlet(ViewletBase):
    render = ViewPageTemplateFile('templates/hebergements_map.pt')

    def getHebergements(self):
        """
        Returns hebs that must be shown on map
        """
        wrapper = getSAWrapper('gites_wallons')
        session = wrapper.session
        Hebergement = wrapper.getMapper('hebergement')
        query = session.query(Hebergement)
        query = query.limit(10)
        hebergements = query.all()
        results = []
        for hebergement in hebergements:
            results.append({'types': ['gites'],
                            'latitude': hebergement.heb_gps_lat,
                            'longitude': hebergement.heb_gps_long})
        writer = getUtility(IJSONWriter)
        return writer.write(results)
