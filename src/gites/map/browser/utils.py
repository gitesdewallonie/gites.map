# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""

from sqlalchemy import select
from z3c.sqlalchemy import getSAWrapper
from zope.component import queryMultiAdapter
from plone.memoize import instance
from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName

from gites.core.interfaces import IHebergementsFetcher

# chambres : 'CH', 'MH', 'CHECR'
# gites    : 'GR', 'GF', 'MT', 'GC', 'MV', 'GRECR', 'GG'


class UtilsView(BrowserView):
    """
    Contains methods used by and for map viewlet
    """

    @instance.memoize
    def shouldShowMapViewlet(self):
        fetcher = queryMultiAdapter((self.context, self, self.request),
                                    IHebergementsFetcher)
        if fetcher is None:
            return False
        else:
            return True

    def getMaisonsDuTourisme(self):
        wrapper = getSAWrapper('gites_wallons')
        MaisonTouristique = wrapper.getMapper('maison_tourisme')
        query = select([MaisonTouristique.mais_nom,
                        MaisonTouristique.mais_url,
                        MaisonTouristique.mais_gps_long,
                        MaisonTouristique.mais_gps_lat])
        maisons = query.execute().fetchall()
        results = []
        for maison in maisons:
            title = '<a href="%s" title="%s">%s</a>' % (maison.mais_url,
                                                        maison.mais_nom,
                                                        maison.mais_nom)
            results.append({'types': ['maisontourisme'],
                            'name': title,
                            'vicinity': '',
                            'latitude': maison.mais_gps_long,
                            'longitude': maison.mais_gps_lat})
        return results

    def getInfosTouristiques(self):
        wrapper = getSAWrapper('gites_wallons')
        InfoTouristique = wrapper.getMapper('info_touristique')
        TypeInfoTouristique = wrapper.getMapper('type_info_touristique')
        query = select([InfoTouristique.infotour_nom,
                        InfoTouristique.infotour_url,
                        InfoTouristique.infotour_gps_long,
                        InfoTouristique.infotour_gps_lat,
                        TypeInfoTouristique.typinfotour_nom_fr,
                        InfoTouristique.infotour_localite])
        query.append_whereclause(TypeInfoTouristique.typinfotour_pk == InfoTouristique.infotour_type_infotour_fk)
        infos = query.execute().fetchall()
        results = []
        for info in infos:
            title = '<a href="%s" title="%s">%s</a>' % (info.infotour_url,
                                                        info.infotour_nom,
                                                        info.infotour_nom)
            results.append({'types': ['infotouristique'],
                            'name': title,
                            'vicinity': info.infotour_localite,
                            'latitude': info.infotour_gps_long,
                            'longitude': info.infotour_gps_lat})
        return results

    def getInfosPratiques(self):
        wrapper = getSAWrapper('gites_wallons')
        InfoPratique = wrapper.getMapper('info_pratique')
        TypeInfoPratique = wrapper.getMapper('type_info_pratique')
        query = select([InfoPratique.infoprat_nom,
                        InfoPratique.infoprat_url,
                        InfoPratique.infoprat_gps_long,
                        InfoPratique.infoprat_gps_lat,
                        TypeInfoPratique.typinfoprat_nom_fr,
                        InfoPratique.infoprat_localite])
        query.append_whereclause(InfoPratique.infoprat_type_infoprat_fk == TypeInfoPratique.typinfoprat_pk)
        infos = query.execute().fetchall()
        results = []
        for info in infos:
            title = '<a href="%s" title="%s">%s</a>' % (info.infoprat_url,
                                                        info.infoprat_nom,
                                                        info.infoprat_nom)
            results.append({'types': ['infopratique'],
                            'name': title,
                            'vicinity': info.infoprat_localite,
                            'latitude': info.infoprat_gps_long,
                            'longitude': info.infoprat_gps_lat})
        return results

    def getAllHebergements(self):
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
            # XXX temporary photo (no photos on localhost)
            photoUrl = 'http://gitesdewallonie.be/photos_heb/CHECR56011156500.jpg'
            hebUrl = queryMultiAdapter((hebergement, self.request),
                                       name="url")()
            hebName = hebergement.heb_nom
            title = '<a href="%s" title="%s">%s</a>' % (hebUrl, hebName, hebName)
            bodyText = """%s
                          <br />
                          <img src="%s" />
                          <br />
                          <img src="%s" />
                          %s/%s""" \
                          % (hebergement.heb_localite,
                             photoUrl,
                             '%s/++resource++gites.map.images/capacity.png' % portalUrl,
                             hebergement.heb_cgt_cap_min,
                             hebergement.heb_cgt_cap_max)
            # XXX we need to invert lat and long for now !!!
            results.append({'types': [typeStr],
                            'name': title,
                            'vicinity': bodyText,
                            'latitude': hebergement.heb_gps_long,
                            'longitude': hebergement.heb_gps_lat})
        return results
