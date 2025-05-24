# fuwoo_api/permissions.py

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Lecture pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture seulement pour le propriétaire
        return obj == request.user or hasattr(obj, 'user') and obj.user == request.user

class IsProviderOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Lecture pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Création seulement pour les prestataires
        return request.user.is_authenticated and request.user.role == 'prestataire'
    
    def has_object_permission(self, request, view, obj):
        # Lecture pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Modification seulement pour le propriétaire du service
        return obj.provider == request.user