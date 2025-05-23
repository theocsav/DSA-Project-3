import os
import pandas as pd
import numpy as np
import random
import math
import time
import pickle
from transactions.models import Transaction

def majority_vote(labels):
    unique_vals, counts = np.unique(labels, return_counts=True)
    return unique_vals[np.argmax(counts)]

class CustomRandomTree:
    def __init__(self, max_depth, min_samples_split, feature_subset_size):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.feature_subset_size = feature_subset_size

        self.split_feature_index = None
        self.split_value = None
        self.left_child = None
        self.right_child = None
        self.is_leaf = False
        self.prediction = None

    def fit(self, X, labels, depth=0):
        num_samples, num_features = X.shape

        self.prediction = majority_vote(labels)

        if (depth >= self.max_depth) or (num_samples < self.min_samples_split) or (len(np.unique(labels)) == 1):
            self.is_leaf = True
            return

        available_indices = list(range(num_features))
        num_to_select = min(self.feature_subset_size, num_features)
        feature_indices = random.sample(available_indices, num_to_select)
        best_gini = float('inf')
        best_split = None

        for feature in feature_indices:
            feature_values = X[:, feature]
            f_min = np.min(feature_values)
            f_max = np.max(feature_values)
            if f_min == f_max:
                continue
            for _ in range(10):
                threshold = random.uniform(f_min, f_max)

                left_mask = feature_values < threshold
                right_mask = ~left_mask

                if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
                    continue

                gini_val = self.weighted_gini(labels[left_mask], labels[right_mask])
                if gini_val < best_gini:
                    best_gini = gini_val
                    best_split = (feature, threshold)

        if best_split is None:
            self.is_leaf = True
            return

        self.split_feature_index, self.split_value = best_split

        left_mask = X[:, self.split_feature_index] < self.split_value
        right_mask = ~left_mask

        self.left_child = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
        self.left_child.fit(X[left_mask], labels[left_mask], depth + 1)

        self.right_child = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
        self.right_child.fit(X[right_mask], labels[right_mask], depth + 1)

    def gini(self, labels):
        m = len(labels)
        if m == 0:
            return 0
        _, counts = np.unique(labels, return_counts=True)
        impurity = 1.0 - np.sum((counts / m) ** 2)
        return impurity

    def weighted_gini(self, left_labels, right_labels):
        m_left = len(left_labels)
        m_right = len(right_labels)
        m_total = m_left + m_right

        gini_left = self.gini(left_labels)
        gini_right = self.gini(right_labels)

        weighted_gini_left = (m_left / m_total) * gini_left
        weighted_gini_right = (m_right / m_total) * gini_right

        return weighted_gini_left + weighted_gini_right

    def predict(self, sample):
        if self.is_leaf:
            return self.prediction
        if sample[self.split_feature_index] < self.split_value:
            return self.left_child.predict(sample)
        else:
            return self.right_child.predict(sample)

class CustomRandomForest:
    def __init__(self, n_trees=100, sample_size=None, max_depth=10, min_samples_split=2, feature_subset_size=None):
        self.n_trees = n_trees
        self.sample_size = sample_size
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.feature_subset_size = feature_subset_size
        self.trees = []

    def fit(self, X, labels):
        num_samples, num_features = X.shape

        if self.sample_size is None:
            self.sample_size = num_samples
        if self.feature_subset_size is None:
            self.feature_subset_size = int(math.sqrt(num_features))

        self.trees = []
        for _ in range(self.n_trees):
            indices = np.random.choice(num_samples, self.sample_size, replace=True)
            X_sample = X[indices]
            labels_sample = labels[indices]

            tree = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
            tree.fit(X_sample, labels_sample)
            self.trees.append(tree)

    def predict(self, X):
        predictions = []
        for sample in X:
            tree_preds = []
            for tree in self.trees:
                tree_preds.append(tree.predict(sample))
            predictions.append(majority_vote(np.array(tree_preds)))
        return np.array(predictions)

class RandomForestAnalyzer:
    # Define the path to save/load the model
    MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(MODEL_DIR, 'trained_random_forest.pkl')
    
    @staticmethod
    def prepare_data():
        """Fetch transaction data from database and prepare for analysis"""
        # Get transaction data from Django models
        transactions = Transaction.objects.all().values()
        df = pd.DataFrame(list(transactions))
        
        # Select features for the model
        features = df[['amt', 'distance_km', 'age', 'trans_hour']]
        
        # Target variable
        labels = df['is_fraud'].values
        
        return features.values, labels, df
    
    @staticmethod
    def run_analysis(n_trees=100, max_depth=10, min_samples_split=2, feature_subset_size=None):
        """
        Run the Random Forest algorithm on database data.
        Saves the trained model to disk and returns metrics and execution details.
        """
        # Set random seed for reproducibility
        np.random.seed(42)
        random.seed(42)
        
        start_time = time.time()
        
        # Prepare data - now also getting the original DataFrame
        features, true_labels, df = RandomForestAnalyzer.prepare_data()
        
        # Initialize and train model
        model = CustomRandomForest(
            n_trees=n_trees,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            feature_subset_size=feature_subset_size
        )
        
        # Train the model
        model.fit(features, true_labels)
        
        # Save the trained model to disk
        try:
            with open(RandomForestAnalyzer.MODEL_PATH, 'wb') as f:
                pickle.dump(model, f)
            model_save_status = f"Model saved successfully to {RandomForestAnalyzer.MODEL_PATH}"
        except Exception as e:
            model_save_status = f"Error saving model: {e}"
        
        # Get predictions
        predictions = model.predict(features)

        # Get scores
        scores = model.predict(features)
        
        # Calculate metrics
        true_pos = np.sum((predictions == 1) & (true_labels == 1))
        false_pos = np.sum((predictions == 1) & (true_labels == 0))
        false_neg = np.sum((predictions == 0) & (true_labels == 1))
        true_neg = np.sum((predictions == 0) & (true_labels == 0))
        
        accuracy = (true_pos + true_neg) / len(true_labels)
        precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
        recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        # Identify fraud transactions
        fraud_indices = np.where(predictions == 1)[0]
        fraud_transactions = df.iloc[fraud_indices].to_dict('records')

        non_fraud_indices = np.where(predictions == 0)[0]
        non_fraud_transactions = df.iloc[non_fraud_indices].to_dict('records')
        
        execution_time = time.time() - start_time
        
        # Return results with model save status
        result = {
            'execution_time': execution_time,
            'accuracy': round(accuracy, 2),
            'precision': round(precision, 2),
            'recall': round(recall, 2),
            'f1_score': round(f1, 2),
            'confusion_matrix': {
                'true_positives': int(true_pos),
                'false_positives': int(false_pos),
                'false_negatives': int(false_neg),
                'true_negatives': int(true_neg)
            },
            'data_points': len(features),
            # Removing large arrays from the response to prevent site crashes
            # 'features': features.tolist(),
            # 'scores': scores.tolist(), 
            # 'predictions': predictions.tolist(),
            'algorithm': 'custom_random_forest',
            'data_structure': 'binary_trees',
            'parameters': {
                'n_trees': n_trees,
                'max_depth': max_depth,
                'min_samples_split': min_samples_split,
                'feature_subset_size': feature_subset_size
            },
            'model_save_status': model_save_status,
            'fraud_transactions': fraud_transactions,
            'fraud_count': len(fraud_transactions),
            'non_fraud_transactions': non_fraud_transactions,
            'fraud_percentage': round((len(fraud_transactions) / len(features)) * 100, 2)
        }
        
        return result
    
    @staticmethod
    def predict_with_saved_model(input_features=None, **kwargs):
        """
        Use the saved model to make predictions of data.
        
        Args:
            input_features: List or array of feature values in format [amt, distance_km, age, trans_hour]
                           Can be a single sample or multiple samples. If None, will return model info only.
                           If 'training_data', will predict on all data used for training.
            **kwargs: Additional arguments (ignored, for compatibility with views)
        
        Returns:
            Dict containing predictions and status
        """
        try:
            # Check if the model file exists
            if not os.path.exists(RandomForestAnalyzer.MODEL_PATH):
                return {
                    'status': 'error',
                    'message': f'Trained model not found at {RandomForestAnalyzer.MODEL_PATH}. Please train the model first.'
                }
            
            # Load the model from disk
            with open(RandomForestAnalyzer.MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            
            # If input_features is 'training_data', use the same data from prepare_data
            if input_features == 'training_data':
                start_time = time.time()
                features, true_labels, df = RandomForestAnalyzer.prepare_data()
                
                # Make predictions
                predictions = model.predict(features)
                
                # Calculate metrics
                true_pos = np.sum((predictions == 1) & (true_labels == 1))
                false_pos = np.sum((predictions == 1) & (true_labels == 0))
                false_neg = np.sum((predictions == 0) & (true_labels == 1))
                true_neg = np.sum((predictions == 0) & (true_labels == 0))
                
                accuracy = (true_pos + true_neg) / len(true_labels)
                precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
                recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
                f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
                
                # Identify fraud transactions
                fraud_indices = np.where(predictions == 1)[0]
                fraud_transactions = df.iloc[fraud_indices].to_dict('records')

                non_fraud_indices = np.where(predictions == 0)[0]
                non_fraud_transactions = df.iloc[non_fraud_indices].to_dict('records')
                
                execution_time = time.time() - start_time
                
                # Return results with the exact same structure as run_analysis
                return {
                    'execution_time': execution_time,
                    'accuracy': round(accuracy, 2),
                    'precision': round(precision, 2),
                    'recall': round(recall, 2),
                    'f1_score': round(f1, 2),
                    'confusion_matrix': {
                        'true_positives': int(true_pos),
                        'false_positives': int(false_pos),
                        'false_negatives': int(false_neg),
                        'true_negatives': int(true_neg)
                    },
                    'data_points': len(features),
                    # Removing large arrays from the response to prevent site crashes
                    # 'features': features.tolist(),
                    # 'scores': predictions.tolist(),  # Using predictions as scores
                    # 'predictions': predictions.tolist(),
                    'algorithm': 'custom_random_forest',
                    'data_structure': 'binary_trees',
                    'parameters': {
                        'n_trees': model.n_trees,
                        'max_depth': model.max_depth,
                        'min_samples_split': model.min_samples_split,
                        'feature_subset_size': model.feature_subset_size
                    },
                    'model_save_status': 'Using saved model',
                    'fraud_transactions': fraud_transactions,
                    'fraud_count': len(fraud_transactions),
                    'non_fraud_transactions': non_fraud_transactions,
                    'fraud_percentage': round((len(fraud_transactions) / len(features)) * 100, 2)
                }
            
            # If no input features provided, just return model info
            if input_features is None:
                return {
                    'status': 'success',
                    'message': 'Model is loaded and ready for predictions',
                    'model_used': RandomForestAnalyzer.MODEL_PATH,
                    'model_parameters': {
                        'n_trees': model.n_trees,
                        'max_depth': model.max_depth,
                        'min_samples_split': model.min_samples_split,
                        'feature_subset_size': model.feature_subset_size
                    },
                    'usage': 'To make predictions, provide input_features parameter with format [amt, distance_km, age, trans_hour] or use "training_data" to predict on all training data'
                }
            
            # Convert input to numpy array
            input_array = np.array(input_features)
            
            # Handle single sample vs multiple samples
            if input_array.ndim == 1:
                input_array = input_array.reshape(1, -1)
            
            # Make predictions
            predictions = model.predict(input_array)
            
            return {
                'status': 'success',
                'predictions': predictions.tolist(),
                'model_used': RandomForestAnalyzer.MODEL_PATH
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error making predictions: {str(e)}'
            }