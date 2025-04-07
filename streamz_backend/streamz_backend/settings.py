import os
import environ
import dj_database_url

# Inicializar environ
env = environ.Env()
WSGI_APPLICATION = 'streamz_backend.wsgi.application'
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-0d8s3hf#k6vn5f2p&13=ysl@psa74ub^_3$dn83g7_nwl*$u_v'

# Leer archivo .env si existe
environ.Env.read_env()

ROOT_URLCONF = 'streamz_backend.urls'

# Configuración de base de datos para desarrollo local y Railway
# Definir BASE_DIR si no existe
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuración de base de datos usando SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Añadir corsheaders a las aplicaciones instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps propias
    'authentication',
    'content',
    'streaming',
    
    # Paquetes de terceros
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters'
]

# Configuración de CORS
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Para desarrollo con React
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Para producción, permitir el origen de Railway
if os.environ.get('RAILWAY_STATIC_URL'):
    CORS_ALLOWED_ORIGINS.append(os.environ.get('RAILWAY_STATIC_URL'))

# Al final del archivo
AUTH_USER_MODEL = 'authentication.User'

DEBUG = True

USE_TZ = False

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

ALLOWED_HOSTS = ['web-production-22cc4.up.railway.app', '.railway.app', 'localhost', '127.0.0.1']