import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuwoo_api', '0018_servicerequest_availability_windows'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='is_recurring',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='recurrence_frequency',
            field=models.CharField(
                blank=True,
                choices=[
                    ('weekly',   'Hebdomadaire'),
                    ('biweekly', 'Aux deux semaines'),
                    ('monthly',  'Mensuel'),
                    ('seasonal', 'Saisonnier (3 mois)'),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='parent_request',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='recurrences',
                to='fuwoo_api.servicerequest',
            ),
        ),
    ]
