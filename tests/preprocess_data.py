import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

def haversine(lat1, lon1, lat2, lon2):
    R = 6378
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    
    return (R * c * 1000) / 1000

def main():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(BASE_DIR, 'data', 'fraudTrain.csv')
    
    df = pd.read_csv(file_path)

    if df.columns[0] == '':
        df = df.iloc[:, 1:]
        
    # Compute the distance between transaction and merchant locations
    df['distance_km'] = haversine(df['lat'], df['long'], df['merch_lat'], df['merch_long'])
    
    df_clean = df[['trans_date_trans_time', 'cc_num', 'merchant', 'category', 'amt',
                   'gender', 'distance_km', 'job', 'dob', 'trans_num', 'unix_time', 'is_fraud']].copy()
    
    # Convert the date columns to datetime objects
    df_clean['trans_date_trans_time'] = pd.to_datetime(df_clean['trans_date_trans_time'])
    df_clean['dob'] = pd.to_datetime(df_clean['dob'])
    
    # Create age at time of transaction
    df_clean['age'] = (df_clean['trans_date_trans_time'] - df_clean['dob']).dt.days / 365.25
    
    # Create the hour of the transaction
    df_clean['trans_hour'] = df_clean['trans_date_trans_time'].dt.hour

    # Encode all categorical features, 'gender', 'merchant', 'category', and 'job'
    categorical_cols = ['gender', 'merchant', 'category', 'job']
    for col in categorical_cols:
        le = LabelEncoder()
        df_clean[col] = le.fit_transform(df_clean[col])
    
    df_processed = df_clean.drop(columns=['cc_num', 'trans_num', 'trans_date_trans_time', 'dob'])
    
    # Separate fraud and non-fraud transactions.
    fraud_df = df_processed[df_processed['is_fraud'] == 1]
    nonfraud_df = df_processed[df_processed['is_fraud'] == 0]
    
    # Choose the number of fraudulent transactions for validation.
    n_fraud_valid = min(10_000, len(fraud_df))
    n_total_valid = 100_000
    n_nonfraud_valid = n_total_valid - n_fraud_valid
    
    fraud_valid = fraud_df.sample(n=n_fraud_valid, random_state=42)
    nonfraud_valid = nonfraud_df.sample(n=n_nonfraud_valid, random_state=42)
    
    # Combine to create the validation set
    df_valid = pd.concat([fraud_valid, nonfraud_valid])
    
    # The remaining data will form the training set.
    df_train = df_processed.drop(df_valid.index)
    
    train_file_path = os.path.join(BASE_DIR, "train_supervised_only.csv")
    valid_file_path = os.path.join(BASE_DIR, "validation_for_all_models.csv")
    
    df_train.to_csv(train_file_path, index=False)
    df_valid.to_csv(valid_file_path, index=False)
    
    print("Training set:", df_train.shape)
    print("Validation set:", df_valid.shape)
    print("Fraud in training:", df_train['is_fraud'].sum())
    print("Fraud in validation:", df_valid['is_fraud'].sum())

if __name__ == "__main__":
    main()
