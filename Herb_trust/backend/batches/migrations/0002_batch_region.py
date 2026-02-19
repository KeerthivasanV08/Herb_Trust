# Generated migration for adding region field to Batch model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('batches', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='batch',
            name='region',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
