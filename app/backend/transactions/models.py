from django.db import models

class Transaction(models.Model):
    """
    Model is a financial transactions for fraud detection analysis.
    """
    
    merchant = models.IntegerField()  # The merchant where transaction happen
    category = models.IntegerField()  # Category of transaction
    amt = models.FloatField()         # Amount of the transaction

    gender = models.IntegerField()    # Gender of the customer
    age = models.FloatField()         # Age of the customer
    job = models.IntegerField()       # Job of the customer
    
    distance_km = models.FloatField() # Distance from typical location
    unix_time = models.IntegerField() # Timestamp of transaction
    trans_hour = models.IntegerField() # Hour when transaction occurred
    
 
    is_fraud = models.IntegerField()  # Is fraud or not
    
    def __str__(self):
        return f"Transaction {self.id}: ${self.amt}"
    
    class Meta:
        indexes = [
            # Indexes to for query performance 
            models.Index(fields=['category']),
            models.Index(fields=['is_fraud']),
            models.Index(fields=['merchant']),
        ]