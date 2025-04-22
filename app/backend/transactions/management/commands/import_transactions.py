import csv
from django.core.management.base import BaseCommand
from transactions.models import Transaction
from django.db import transaction as db_transaction  # Rename to avoid conflict
import os

class Command(BaseCommand):
    help = 'Import transaction data from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'File does not exist: {file_path}'))
            return
        
        self.stdout.write(f'Importing data from {file_path}...')
        
        # Use bulk_create for better performance
        batch_size = 5000
        batch = []
        total_count = 0
        
        with open(file_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                try:
                    # Create Transaction object
                    transaction_obj = Transaction(  # Renamed variable to avoid conflict
                        merchant=int(row['merchant']),
                        category=int(row['category']),
                        amt=float(row['amt']),
                        gender=int(row['gender']),
                        distance_km=float(row['distance_km']),
                        job=int(row['job']),
                        unix_time=int(row['unix_time']),
                        is_fraud=int(row['is_fraud']),
                        age=float(row['age']),
                        trans_hour=int(row['trans_hour'])
                    )
                    batch.append(transaction_obj)
                    total_count += 1
                    
                    if len(batch) >= batch_size:
                        with db_transaction.atomic():  # Use renamed import
                            Transaction.objects.bulk_create(batch)
                        self.stdout.write(f'Imported {total_count} records...')
                        batch = []
                except Exception as e:
                    self.stderr.write(f'Error processing row: {e}')
            
            # Import any remaining records
            if batch:
                with db_transaction.atomic():  # Use renamed import
                    Transaction.objects.bulk_create(batch)
            
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {total_count} records!'))