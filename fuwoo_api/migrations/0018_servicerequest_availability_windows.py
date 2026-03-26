from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuwoo_api', '0017_payment_escrow_v2'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='availability_windows',
            field=models.JSONField(
                blank=True,
                null=True,
                help_text="Liste de plages [{date, start, end} | {flexible: true}]",
            ),
        ),
    ]
