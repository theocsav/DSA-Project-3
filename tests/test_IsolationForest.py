import numpy as np
import pandas as pd
import os
import random
import math

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


class CustomIsolationForest:
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

def load_data(csv_file_path):
    if not os.path.exists(csv_file_path):
        raise FileNotFoundError(f"CSV file '{csv_file_path}' not found")
    
    df = pd.read_csv(csv_file_path)

    if 'is_fraud' in df.columns:
        y = df['is_fraud'].values
        x = df.drop(columns=['is_fraud']).values
    else:
        x = df.values
        y = None

    return x, y

# Demo code
def main():
    # Set random seed
    np.random.seed(42)
    random.seed(42)

    csv_file_path = 'data/100kDataPoints.csv'

    x, y = load_data(csv_file_path)
    
    fraud_detector = CustomIsolationForest(tree_count=120, sample_size=256)
    fraud_detector.plant_forest(x)

    predictions = fraud_detector.detect_anomalies(x, threshold=0.55)    
   
    # Calculate metrics
    accuracy = np.mean(predictions == y)
    true_pos = np.sum((predictions == 1) & (y == 1))
    false_pos = np.sum((predictions == 1) & (y == 0))
    false_neg = np.sum((predictions == 0) & (y == 1))
    true_neg = np.sum((predictions == 0) & (y == 0))

    precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
    recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    print(f"Isolation Forest Accuracy: {accuracy:.2f}")
    print(f"Precision: {precision:.2f}")
    print(f"Recall: {recall:.2f}")
    print(f"F1 Score: {f1:.2f}")
    print("\nConfusion Matrix:")
    print(f"True Positives: {true_pos}")
    print(f"False Positives: {false_pos}")
    print(f"False Negatives: {false_neg}")
    print(f"True Negatives: {true_neg}")

if __name__ == "__main__":
    main()