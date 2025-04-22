import numpy as np
import pandas as pd
import random
import math
import time
import pickle
import os
from transactions.models import Transaction

class FraudTree:
    def __init__(self, max_depth):
        self.max_depth = max_depth
        self.split_attr = None
        self.split_point = None
        self.left_branch = None
        self.right_branch = None
        self.node_samples = 0
        self.is_leaf = False
    
    def grow(self, data_slice, depth=0):
        #Grow tree by splitting data
        self.node_samples = len(data_slice)
        
        # Stop conditions
        if (depth >= self.max_depth or 
            len(data_slice) <= 1 or 
            self._all_same(data_slice)):
            self.is_leaf = True
            return
        
        # Random feature selection
        feature_count = data_slice.shape[1]
        self.split_attr = random.randrange(feature_count)
        
        # Find value range
        feature_min = np.min(data_slice[:, self.split_attr])
        feature_max = np.max(data_slice[:, self.split_attr])
        
        if feature_min == feature_max:
            self.is_leaf = True
            return
        
        # Random split point
        self.split_point = feature_min + random.random() * (feature_max - feature_min)
        
        # Split data
        left_mask = data_slice[:, self.split_attr] < self.split_point
        right_mask = ~left_mask
        
        left_data = data_slice[left_mask]
        right_data = data_slice[right_mask]
        
        if len(left_data) == 0 or len(right_data) == 0:
            self.is_leaf = True
            return
        
        # Create branches
        self.left_branch = FraudTree(self.max_depth)
        self.left_branch.grow(left_data, depth + 1)
        
        self.right_branch = FraudTree(self.max_depth)
        self.right_branch.grow(right_data, depth + 1)
    
    def _all_same(self, data_slice):
        #Check if data points are identical
        if len(data_slice) <= 1:
            return True
        
        return np.all(np.all(data_slice == data_slice[0, :], axis=1))
    
    def isolation_depth(self, sample, current_depth=0):
        #Find isolation depth of a sample
        if self.is_leaf:
            if self.node_samples <= 1:
                return current_depth
            
            # Average path length approximation
            return current_depth + self._expected_path_length(self.node_samples)
        
        if sample[self.split_attr] >= self.split_point:
            return self.right_branch.isolation_depth(sample, current_depth + 1)
        else:
            return self.left_branch.isolation_depth(sample, current_depth + 1)
    
    def _expected_path_length(self, n):
        #Expected path length calculation
        if n <= 1:
            return 0
        
        return 2 * (math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n)


class IsolationForest:
    #Forest of isolation trees for anomaly detection
    
    def __init__(self, tree_count=100, sample_size=256, max_tree_depth=None):
        self.tree_count = tree_count
        self.sample_size = sample_size
        self.max_tree_depth = max_tree_depth
        self.fraud_trees = []
    
    def plant_forest(self, data):
        #Build forest of isolation trees
        data_size = len(data)
        
        if self.max_tree_depth is None:
            self.max_tree_depth = int(math.ceil(math.log2(self.sample_size)))
        
        for _ in range(self.tree_count):
            if data_size > self.sample_size:
                sample_indices = random.sample(range(data_size), self.sample_size)
                data_sample = data[sample_indices]
            else:
                data_sample = data
            
            tree = FraudTree(self.max_tree_depth)
            tree.grow(data_sample)
            self.fraud_trees.append(tree)
    
    def calc_anomaly_score(self, sample):
        #Calculate anomaly score
        path_lengths = [tree.isolation_depth(sample) for tree in self.fraud_trees]
        avg_path = sum(path_lengths) / len(path_lengths)
        
        c_factor = self._normalization_factor(self.sample_size)
        
        # Higher score = more anomalous
        score = 2 ** (-avg_path / c_factor)
            
        return score
    
    def get_all_scores(self, data):
        #Get scores for all samples
        return np.array([self.calc_anomaly_score(sample) for sample in data])
    
    def detect_anomalies(self, data, threshold=0.6):
        #Flag anomalies based on threshold
        scores = self.get_all_scores(data)
        return np.where(scores >= threshold, 1, 0)
    
    def _normalization_factor(self, size):
        #Normalize paths based on sample size
        if size <= 1:
            return 1.0
        return 2 * (math.log(size - 1) + 0.5772156649) - (2 * (size - 1) / size)


class IsolationForestAnalyzer:
    # Define the path to save/load the model
    MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(MODEL_DIR, 'trained_isolation_forest.pkl')
    
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
    def train_model(tree_count=120, sample_size=256, threshold=0.55):
        """
        Train an Isolation Forest model on the transaction data and save it.
        
        Args:
            tree_count: Number of trees to build in the forest
            sample_size: Number of samples to use for each tree
            threshold: Anomaly score threshold for binary classification
            
        Returns:
            The trained model and message about the training
        """
        # Set random seed for reproducibility
        np.random.seed(42)
        random.seed(42)
        
        # Get the data
        features, true_labels, _ = IsolationForestAnalyzer.prepare_data()
        
        # Initialize model
        model = IsolationForest(
            tree_count=tree_count,
            sample_size=sample_size
        )
        
        # Add timing info for debugging
        print(f"Starting forest training with {tree_count} trees...")
        forest_start = time.time()
        
        # Train the model
        model.plant_forest(features)
        
        forest_time = time.time() - forest_start
        print(f"Forest training completed in {forest_time:.2f} seconds")
        
        # Save the model for future use
        try:
            with open(IsolationForestAnalyzer.MODEL_PATH, 'wb') as f:
                pickle.dump({
                    'model': model,
                    'threshold': threshold
                }, f)
            model_save_status = f"Model saved successfully to {IsolationForestAnalyzer.MODEL_PATH}"
        except Exception as e:
            model_save_status = f"Error saving model: {e}"
            
        return {
            'model': model,
            'threshold': threshold,
            'save_status': model_save_status
        }
    
    @staticmethod
    def run_analysis(tree_count=120, sample_size=256, threshold=0.55):
        """
        Run the Isolation Forest algorithm on database data.
        Returns metrics and execution details.
        """
        start_time = time.time()
        
        # Train the model (or use existing code to train)
        training_result = IsolationForestAnalyzer.train_model(tree_count, sample_size, threshold)
        model = training_result['model']
        model_save_status = training_result['save_status']
        
        # Get data for evaluation
        features, true_labels, df = IsolationForestAnalyzer.prepare_data()
        
        # Get predictions
        predictions = model.detect_anomalies(features, threshold=threshold)

        # Get scores
        scores = model.get_all_scores(features)
        
        # Calculate metrics
        true_pos = np.sum((predictions == 1) & (true_labels == 1))
        false_pos = np.sum((predictions == 1) & (true_labels == 0))
        false_neg = np.sum((predictions == 0) & (true_labels == 1))
        true_neg = np.sum((predictions == 0) & (true_labels == 0))
        
        # Identify fraud transactions
        fraud_indices = np.where(predictions == 1)[0]
        fraud_transactions = df.iloc[fraud_indices].to_dict('records')

        non_fraud_indices = np.where(predictions == 0)[0]
        non_fraud_transactions = df.iloc[non_fraud_indices].to_dict('records')


        accuracy = (true_pos + true_neg) / len(true_labels)
        precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
        recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        execution_time = time.time() - start_time
        
        # Save the model for future predictions
        try:
            with open(IsolationForestAnalyzer.MODEL_PATH, 'wb') as f:
                pickle.dump({
                    'model': model,
                    'threshold': threshold
                }, f)
            model_save_status = f"Model saved successfully to {IsolationForestAnalyzer.MODEL_PATH}"
        except Exception as e:
            model_save_status = f"Error saving model: {e}"
            
        # Return results with fraud transactions and model status
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
            # 'scores': scores.tolist(),
            # 'predictions': predictions.tolist(),
            'algorithm': 'custom_isolation_forest',
            'data_structure': 'binary_trees',
            'parameters': {
                'tree_count': tree_count,
                'sample_size': sample_size,
                'threshold': threshold
            },
            'model_save_status': model_save_status,
            'fraud_transactions': fraud_transactions,
            'non_fraud_transactions': non_fraud_transactions,
            'fraud_count': len(fraud_transactions)
        }
    
    @staticmethod
    def predict_on_training_data(threshold=None):
        """
        Use the saved Isolation Forest model to predict on the training data.
        
        Args:
            threshold: Optional anomaly threshold. If None, uses the threshold from the saved model.
            
        Returns:
            Dict with prediction results and fraud transactions in the same format as run_analysis
        """
        try:
            # Check if model file exists
            if not os.path.exists(IsolationForestAnalyzer.MODEL_PATH):
                return {
                    'status': 'error',
                    'message': f'Trained model not found at {IsolationForestAnalyzer.MODEL_PATH}. Please train the model first.'
                }
                
            # Load the model
            with open(IsolationForestAnalyzer.MODEL_PATH, 'rb') as f:
                saved_data = pickle.load(f)
                model = saved_data['model']
                saved_threshold = saved_data['threshold']
            
            # Use provided threshold or default to saved value
            threshold = threshold if threshold is not None else saved_threshold
            
            start_time = time.time()
            
            # Get the training data
            features, true_labels, df = IsolationForestAnalyzer.prepare_data()
            
            # Get predictions and scores
            predictions = model.detect_anomalies(features, threshold=threshold)
            scores = model.get_all_scores(features)
            
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
            
            # Return in the same format as run_analysis
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
                # 'scores': scores.tolist(),
                # 'predictions': predictions.tolist(),
                'algorithm': 'custom_isolation_forest',
                'data_structure': 'binary_trees',
                'parameters': {
                    'tree_count': model.tree_count,
                    'sample_size': model.sample_size,
                    'threshold': threshold
                },
                'fraud_transactions': fraud_transactions,
                'fraud_count': len(fraud_transactions),
                'non_fraud_transactions': non_fraud_transactions
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error making predictions: {str(e)}'
            }