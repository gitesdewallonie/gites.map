# -*- coding: utf-8 -*-
"""
gites.map

Licensed under the GPL license, see LICENCE.txt for more details.
Copyright by Affinitic sprl
"""

from sqlalchemy import select
from z3c.sqlalchemy import getSAWrapper
from zope.component import queryMultiAdapter, getMultiAdapter
from zope.i18n import translate
from plone.memoize import instance
from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName

from gites.locales import GitesMessageFactory as _
from gites.db.content.hebergement.hebergement import Hebergement
from gites.map.interfaces import IHebergementsMapFetcher
from gites.core.browser.package import getVignetteURL

DISTANCE_METERS = 10000


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
                                    IHebergementsMapFetcher)
        #XXX ne marche pas avec les jsregistry expressions actuelles
        if fetcher is None:
            return False
        else:
            return True

    def getMaisonsDuTourisme(self, location=None):
        wrapper = getSAWrapper('gites_wallons')
        MaisonTouristique = wrapper.getMapper('maison_tourisme')
        query = select([MaisonTouristique.mais_nom,
                        MaisonTouristique.mais_url,
                        MaisonTouristique.mais_gps_long,
                        MaisonTouristique.mais_gps_lat])
        if location:
            query.append_whereclause(MaisonTouristique.mais_location.distance_sphere(location) < DISTANCE_METERS)

        maisons = query.execute().fetchall()
        results = []
        for maison in maisons:
            title = '<a href="http://%s" title="%s" target="_blank">%s</a>' % (maison.mais_url,
                                                                               maison.mais_nom,
                                                                               maison.mais_nom)
            results.append({'types': ['information_touristique'],
                            'name': title,
                            'vicinity': '',
                            'latitude': maison.mais_gps_lat,
                            'longitude': maison.mais_gps_long})
        return results

    def getInfosTouristiques(self, infoType, infoTypePk, location=None):
        wrapper = getSAWrapper('gites_wallons')
        InfoTouristique = wrapper.getMapper('info_touristique')
        TypeInfoTouristique = wrapper.getMapper('type_info_touristique')
        query = select([InfoTouristique.infotour_nom,
                        InfoTouristique.infotour_url,
                        InfoTouristique.infotour_gps_long,
                        InfoTouristique.infotour_gps_lat,
                        TypeInfoTouristique.typinfotour_nom_fr,
                        InfoTouristique.infotour_localite],
                       InfoTouristique.infotour_type_infotour_fk == infoTypePk)
        if location:
            query.append_whereclause(InfoTouristique.infotour_location.distance_sphere(location) < DISTANCE_METERS)

        query.append_whereclause(TypeInfoTouristique.typinfotour_pk == InfoTouristique.infotour_type_infotour_fk)
        infos = query.execute().fetchall()
        results = []
        for info in infos:
            title = '<a href="http://%s" title="%s" target="_blank">%s</a>' % (info.infotour_url,
                                                                               info.infotour_nom,
                                                                               info.infotour_nom)
            results.append({'types': [infoType],
                            'name': title,
                            'vicinity': info.infotour_localite,
                            'latitude': info.infotour_gps_lat,
                            'longitude': info.infotour_gps_long})
        return results

    def getGares(self, location=None):
        wrapper = getSAWrapper('gites_wallons')
        InfoPratique = wrapper.getMapper('info_pratique')
        TypeInfoPratique = wrapper.getMapper('type_info_pratique')
        query = select([InfoPratique.infoprat_nom,
                        InfoPratique.infoprat_url,
                        InfoPratique.infoprat_gps_long,
                        InfoPratique.infoprat_gps_lat,
                        TypeInfoPratique.typinfoprat_nom_fr,
                        InfoPratique.infoprat_localite],
                       InfoPratique.infoprat_type_infoprat_fk == 4)
        if location:
            query.append_whereclause(InfoPratique.infoprat_location.distance_sphere(location) < DISTANCE_METERS)
        query.append_whereclause(InfoPratique.infoprat_type_infoprat_fk == TypeInfoPratique.typinfoprat_pk)
        infos = query.execute().fetchall()
        results = []
        for info in infos:
            title = '<a href="http://%s" title="%s" target="_blank">%s</a>' % (info.infoprat_url,
                                                                               info.infoprat_nom,
                                                                               info.infoprat_nom)
            results.append({'types': ['gare'],
                            'name': title,
                            'vicinity': info.infoprat_localite,
                            'latitude': info.infoprat_gps_lat,
                            'longitude': info.infoprat_gps_long})
        return results

    def getAllHebergements(self):
        wrapper = getSAWrapper('gites_wallons')
        session = wrapper.session
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

    def getQuefaireEvents(self, location=None):
        """
        get events from quefaire.be service
        map_external_data is filled by quefaire.be service
        """
        return self.getExtDatas('quefaire.be', 'evenement', location)

    def getRestos(self, location=None):
        """
        get restos from resto.be service
        map_external_data is filled by resto.be service
        """
        return self.getExtDatas('resto.be', 'restaurant', location)

    def getExtDatas(self, extDataProvider, extDataType, location):
        """
        Get map external datas by type
        """
        wrapper = getSAWrapper('gites_wallons')
        session = wrapper.session
        ExtData = wrapper.getMapper('map_external_data')
        query = session.query(ExtData).outerjoin('blacklist')
        query = query.filter(ExtData.ext_data_provider_pk == extDataProvider)
        query = query.filter(ExtData.blacklist == None)
        if location:
            query = query.filter(ExtData.ext_data_location.distance_sphere(location) < DISTANCE_METERS)

        results = []
        for extData in query.all():
            results.append(extDataToMapObject(extData=extData,
                                              extDataType=extDataType))
        return results


def hebergementToMapObject(hebergement, context, request, digit=None):
    """
    Transform an hebergement into an object used on the map
    """
    photo = '%s00.jpg' % hebergement.heb_code_gdw
    portalUrl = getToolByName(context, 'portal_url')()
    photoUrl = "%s/photos_heb/%s" % (portalUrl, photo)
    hebUrl = queryMultiAdapter((hebergement, request), name="url_heb")
    if hebUrl:
        hebUrl = hebUrl()
    hebName = hebergement.heb_nom
    if isinstance(hebergement, Hebergement):  # XXX Adapter
        epis = hebergement.epis[0].heb_nombre_epis
        type_heb = hebergement.type.type_heb_type
        isCle = hebergement.type.heb_type_code == 'MV'
    else:
        epis = hebergement.heb_nombre_epis
        type_heb = hebergement.heb_type_type
        isCle = hebergement.heb_type_code == 'MV'

    personnesTrans = translate(_(u"x_personnes", u"personnes"), context=request)
    chambresTrans = translate(_(u"x_chambres", u"chambres"), context=request)
    episTrans = translate(_(u"x_cles", u"clés"), context=request)
    clesTrans = translate(_(u"x_epis", u"épis"), context=request)

    link = '<a href="%s" title="%s" class="map_infowindow_title">%s</a>' % (
        hebUrl, hebName, hebName)
    bodyText = """<div class="map_infowindow_%s">
                    %s
                    <br />
                    <p class="map_infowindow_description">%s</p>
                    <img class="map_infowindow_img" src="%s">
                    <br />
                    <div class="info_box">
                        <span class="map_infowindow_nombre"> %s/%s</span>
                        %s
                    </div>
                    <div class="info_box">
                        <span class="map_infowindow_nombre"> %s</span>
                        %s
                    </div>
                    <div class="info_box">
                        <span class="map_infowindow_nombre"> %s</span>
                        %s
                    </div>
                  </div>
                  """ \
                  % (type_heb,
                     link,
                     hebergement.heb_localite,
                     photoUrl,
                     hebergement.heb_cgt_cap_min,
                     hebergement.heb_cgt_cap_max,
                     personnesTrans,
                     hebergement.heb_cgt_nbre_chmbre,
                     chambresTrans,
                     epis,
                     isCle and clesTrans or episTrans)
    return {'types': [type_heb],
            'name': '',
            'vicinity': bodyText,
            'latitude': hebergement.heb_gps_lat,
            'longitude': hebergement.heb_gps_long,
            'digit': digit,
            'heb_pk': hebergement.heb_pk}


def packageToMapObject(context):
    """
    Transform a package into an object user on the map
    """
    if context.geolocation is None:
        return
    imageUrl = getVignetteURL(context)
    rangeOfDate = ""
    if context.endDate is not None:
        rangeOfDate = "%s / %s" % (context.startDate.strftime('%d/%m/%Y'),
                                   context.endDate.strftime('%d/%m/%Y'))
    link = """<a href="%s" title="%s" class="map_infowindow_title">%s</a>""" % (
        context.absolute_url(), context.Title(), context.Title())
    bodyText = """<div class="map_infowindow_package">
                    %s
                    <br />
                    <p class="map_infowindow_description">%s</p>
                    <p class="map_infowindow_description">%s</p>
                    <img class="map_infowindow_img" src="%s" />
                    <br />
                  </div>
                  """ \
                    % (link,
                       context.description(),
                       rangeOfDate,
                       imageUrl)
    return {'types': ['map_package'],
            'name': '',
            'vicinity': bodyText,
            'latitude': float(context.geolocation[0]),
            'longitude': float(context.geolocation[1])}


def extDataToMapObject(extData, extDataType):
    """
    Transform an hebergement into an object used on the map
    """
    link = '<a href="%s" title="%s" class="map_infowindow_title" target="_blank">%s</a>' % (
        extData.ext_data_url,
        extData.ext_data_title,
        extData.ext_data_title)

    dateString = ''
    if extData.ext_data_date_begin or extData.ext_data_date_end:
        dateString = '%s / %s' % (extData.ext_data_date_begin and extData.ext_data_date_begin.strftime('%d-%m-%Y') or '',
                                  extData.ext_data_date_end and extData.ext_data_date_end.strftime('%d-%m-%Y') or '')

    bodyText = """<div class="map_infowindow_extdata">
                    %s,
                    <p class="map_infowindow_description">%s</p>
                    <p class="map_infowindow_description">%s</p>
                    <p class="map_infowindow_description"><img class="map_infowindow_img" src="%s" /></p>
                  </div>
                  """ % (
        link,
        extData.ext_data_type or '',
        dateString,
        extData.ext_data_picture_url or '')
    return {'types': [extDataType],
            'name': '',
            'vicinity': bodyText,
            'latitude': extData.ext_data_latitude,
            'longitude': extData.ext_data_longitude}
