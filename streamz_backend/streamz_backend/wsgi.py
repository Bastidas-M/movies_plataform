"""
WSGI config for streamz_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'streamz_backend.settings')

# === INICIO: Script temporal para producción ===
try:
    import django
    django.setup()

    from django.core.management import call_command
    from django.contrib.auth import get_user_model

    print("🚀 Ejecutando migraciones...")
    call_command('migrate')

except Exception as e:
    print(f"❌ Error durante migraciones o creación de superusuario: {e}")
# === FIN: Script temporal ===

application = get_wsgi_application()
