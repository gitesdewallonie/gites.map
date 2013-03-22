# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""

from sqlalchemy import select
from z3c.sqlalchemy import getSAWrapper
from zope.component import queryMultiAdapter, getMultiAdapter
from plone.memoize import instance
from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName

from gites.core.interfaces import IHebergementsFetcher


class UtilsView(BrowserView):
    """
    Contains methods used by and for map viewlet
    """

    def _isEditView(self):
        context = self.context
        context_state = getMultiAdapter((context, self.request), name=u'plone_context_state')
        return context_state.current_page_url().endswith('edit')

    @instance.memoize
    def shouldShowMapViewlet(self, view=None):
        if view is None:
            view = self
        if self._isEditView():
            return False
        fetcher = queryMultiAdapter((self.context, view, self.request),
                                    IHebergementsFetcher)
        #XXX ne marche pas avec les jsregistry expressions actuelles
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
                            'latitude': maison.mais_gps_lat,
                            'longitude': maison.mais_gps_long})
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
                            'latitude': info.infotour_gps_lat,
                            'longitude': info.infotour_gps_long})
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
                            'latitude': info.infoprat_gps_lat,
                            'longitude': info.infoprat_gps_long})
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
        query = query.filter(Hebergement.heb_etat == '1')
        query = query.filter(Proprio.pro_pk == Hebergement.heb_pro_fk)
        query = query.filter(Proprio.pro_etat == True)
        hebergements = query.all()
        hebergements = [hebergement.__of__(self.context.hebergement) for hebergement in hebergements]

        results = []
        for hebergement in hebergements:
            results.append(hebergementToMapObject(hebergement=hebergement,
                                                  context=self.context,
                                                  request=self.request))
        return results

    def getQuefaireEvents(self):
        """
        get events from quefaire.be service

        XXX recuperer les infos de quefaire.be
        apparement on partira sur recuperer et mettre a jour une table en locale qu'on ira requeter ensuite
        """
        return [{'types': ['evenementquefaire'],
                'name': 'evenemtn que faire',
                'vicinity': 'barrrr',
                'latitude': 0,
                'longitude': 0}]

    def getRestos(self):
        """
        get restos from resto.be service

        XXX recuperer les infos de resto.be
        apparement on partira sur recuperer les infos via leur webservice directement
        """
        return [{'types': ['restaurant'],
                'name': 'fooooo',
                'vicinity': 'barrrr',
                'latitude': 1,
                'longitude': 0}]


def hebergementToMapObject(hebergement, context, request):
    """
    Transform an hebergement into an object used on the map
    """
    hebType = hebergement.type.type_heb_code
    typeStr = hebType in ['CH', 'MH', 'CHECR'] and 'chambres' or 'gites'
    photo = hebergement.getVignette()
    portalUrl = getToolByName(context, 'portal_url')()
    photoUrl = "%s/photos_heb/%s" % (portalUrl, photo)
    # XXX temporary photo (no photos on localhost)
    photoUrl = 'http://www.gitesdewallonie.be/vignettes_heb/GR9100523900.jpg'
    hebUrl = queryMultiAdapter((hebergement, request), name="url")()
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
    return {'types': [typeStr],
            'name': title,
            'vicinity': bodyText,
            'latitude': hebergement.heb_gps_lat,
            'longitude': hebergement.heb_gps_long}
