# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl

$Id: viewlets.py 4587 2012-12-04 schminitz
"""

from z3c.json.interfaces import IJSONWriter
from z3c.sqlalchemy import getSAWrapper
from zope.component import getUtility, queryMultiAdapter
from Products.CMFCore.utils import getToolByName
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.layout.viewlets.common import ViewletBase

# chambres : 'CH', 'MH', 'CHECR'
# gites    : 'GR', 'GF', 'MT', 'GC', 'MV', 'GRECR', 'GG'


class GitesMapViewlet(ViewletBase):
    render = ViewPageTemplateFile('templates/hebergements_map.pt')

    def getAllHebergements(self):
        """
        Returns all hebs that can be shown on map
        """
        wrapper = getSAWrapper('gites_wallons')
        session = wrapper.session
        Hebergement = wrapper.getMapper('hebergement')
        TypeHebergement = wrapper.getMapper('type_heb')
        Proprio = wrapper.getMapper('proprio')
        query = session.query(Hebergement)
        query = query.filter(TypeHebergement.type_heb_pk == Hebergement.heb_typeheb_fk)
        query = query.filter(Hebergement.heb_site_public == '1')
        query = query.filter(Proprio.pro_pk == Hebergement.heb_pro_fk)
        query = query.filter(Proprio.pro_etat == True)
        hebergements = query.all()
        hebergements = [hebergement.__of__(self.context.hebergement) for hebergement in hebergements]

        results = []
        for hebergement in hebergements:
            hebType = hebergement.type.type_heb_code
            typeStr = hebType in ['CH', 'MH', 'CHECR'] and 'chambres' or 'gites'
            photo = hebergement.getVignette()
            portalUrl = getToolByName(self.context, 'portal_url')()
            photoUrl = "%s/photos_heb/%s" % (portalUrl, photo)
            hebUrl = queryMultiAdapter((hebergement, self.request),
                                       name="url")()
            hebName = hebergement.heb_nom
            title = '<a href="%s" title="%s">%s</a>' % (hebUrl, hebName, hebName)
            bodyText = """%s<br /><img src="%s" /><br />%s/%s""" \
                          % (hebergement.heb_localite,
                             photoUrl,
                             hebergement.heb_cgt_cap_min,
                             hebergement.heb_cgt_cap_max)
            # XXX we need to invert lat and long for now !!!
            results.append({'types': [typeStr],
                            'name': title,
                            'vicinity': bodyText,
                            'latitude': hebergement.heb_gps_long,
                            'longitude': hebergement.heb_gps_lat})

        writer = getUtility(IJSONWriter)
        return writer.write(results)
