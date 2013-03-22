# -*- coding: utf-8 -*-
from monet.mapsviewlet.viewlets.maps_viewlet import GMapViewlet as BaseGMapViewlet


class GMapViewlet(BaseGMapViewlet):

    @property
    def view_map(self):
        """
        Hide viewlet !
        """
        return False

    def canDisable(self):
        return False
