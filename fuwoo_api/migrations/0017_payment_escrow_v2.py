from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuwoo_api', '0016_payment_escrow_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='work_submitted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='cancellation_reason',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='payment',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending',                'En attente'),
                    ('held',                   'En séquestre'),
                    ('work_submitted',         'Travaux soumis'),
                    ('released',               'Libéré'),
                    ('completed',              'Complété'),
                    ('failed',                 'Échoué'),
                    ('refunded',               'Remboursé'),
                    ('cancellation_requested', 'Annulation demandée'),
                    ('disputed',               'En litige'),
                ],
                default='pending',
                max_length=30,
            ),
        ),
    ]
