from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuwoo_api', '0015_add_terms_cnesst_accepted_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='client_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='payment',
            name='provider_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='payment',
            name='released_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending',   'En attente'),
                    ('held',      'En séquestre'),
                    ('released',  'Libéré'),
                    ('completed', 'Complété'),
                    ('failed',    'Échoué'),
                    ('refunded',  'Remboursé'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
