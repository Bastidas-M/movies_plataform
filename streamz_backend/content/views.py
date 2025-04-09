# content/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Genre, Content, Episode
from .serializers import GenreSerializer, ContentSerializer, ContentDetailSerializer, EpisodeSerializer
from .permissions import HasActiveSubscription
from django.conf import settings
from rest_framework.permissions import IsAuthenticated, AllowAny

class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class ContentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['content_type', 'release_year', 'genres']
    search_fields = ['title', 'description']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_authenticated and hasattr(user, 'plan') and user.plan:
            print("Plan del usuario:", user.plan)  # O usar logging
            return Content.objects.filter(min_subscription_plan__price__lte=user.plan.price)
    # Opcional: si el usuario no está autenticado, puedes devolver un queryset vacío o el contenido público
        return Content.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContentDetailSerializer
        return ContentSerializer
    
    @action(detail=False, methods=['get'])
    def movies(self, request):
        queryset = self.get_queryset().filter(content_type='movie')
    
    # Aplica filtros por query params
        genres = request.query_params.get('genres')
        release_year = request.query_params.get('release_year')

        if genres:
            queryset = queryset.filter(genres__id=genres)
        if release_year:
            queryset = queryset.filter(release_year=release_year)

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    
    @action(detail=False, methods=['get'])
    def series(self, request):
        queryset = self.get_queryset().filter(content_type='series')

    # Filtros manuales
        genres = request.query_params.get('genres')
        release_year = request.query_params.get('release_year')

        if genres:
            queryset = queryset.filter(genres__id=genres)
        if release_year:
            queryset = queryset.filter(release_year=release_year)

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def documentaries(self, request):
        queryset = self.get_queryset().filter(content_type='documentary')

    # Filtros manuales
        genres = request.query_params.get('genres')
        release_year = request.query_params.get('release_year')

        if genres:
            queryset = queryset.filter(genres__id=genres)
        if release_year:
            queryset = queryset.filter(release_year=release_year)

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)