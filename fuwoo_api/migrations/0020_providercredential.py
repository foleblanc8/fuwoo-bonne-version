import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuwoo_api', '0019_servicerequest_recurrence'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProviderCredential',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('credential_type', models.CharField(
                    choices=[
                        ('rbq',       'Licence RBQ'),
                        ('ccq',       'Carte CCQ'),
                        ('cmeq',      'Licence CMEQ (électricité)'),
                        ('cmmtq',     'Licence CMMTQ (plomberie/gaz)'),
                        ('insurance', 'Assurance responsabilité'),
                        ('skill',     'Compétence / spécialité'),
                        ('diploma',   'Diplôme / attestation'),
                        ('other',     'Autre'),
                    ],
                    max_length=20,
                )),
                ('title',          models.CharField(max_length=200)),
                ('license_number', models.CharField(blank=True, max_length=100)),
                ('issued_by',      models.CharField(blank=True, max_length=200)),
                ('issued_year',    models.PositiveSmallIntegerField(blank=True, null=True)),
                ('expires_at',     models.DateField(blank=True, null=True)),
                ('is_verified',    models.BooleanField(default=False)),
                ('created_at',     models.DateTimeField(auto_now_add=True)),
                ('provider', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='credentials',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['credential_type', 'title']},
        ),
    ]
