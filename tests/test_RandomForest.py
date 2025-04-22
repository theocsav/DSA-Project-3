import os
import pandas as pd
import numpy as np
import random
import math

def majority_vote(labels):
    # returns the label with the highest count
    unique_vals, counts = np.unique(labels, return_counts=True)
    return unique_vals[np.argmax(counts)]

class CustomRandomTree:
    def __init__(self, max_depth, min_samples_split, feature_subset_size):
        """
        max_depth: maximum depth of the tree
        min_samples_split: minimum number of samples required to try to split a node
        feature_subset_size: number of features randomly chosen at each split
        """
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.feature_subset_size = feature_subset_size

        # stores the feature and threshold used for splitting
        self.split_feature_index = None
        self.split_value = None
        # holds the subtrees after split
        self.left_child = None
        self.right_child = None
        self.is_leaf = False
        # stores the majority vote at the node
        self.prediction = None

    def fit(self, X, labels, depth=0):
        '''
        X: feature matrix
        labels: their corresponding class labels
        '''
        num_samples, num_features = X.shape

        # stores the majority class at current node
        self.prediction = majority_vote(labels)

        # base case: 1. maximum depth is reached, OR 2. too few samples, OR 3. if all labels are the same
        if (depth >= self.max_depth) or (num_samples < self.min_samples_split) or (len(np.unique(labels)) == 1):
            self.is_leaf = True
            return

        # selects a subset of features at random
        available_indices = list(range(num_features))
        num_to_select = min(self.feature_subset_size, num_features)
        feature_indices = random.sample(available_indices, num_to_select)
        best_gini = float('inf')
        best_split = None

        # tries splitting each candidate feature
        for feature in feature_indices:
            feature_values = X[:, feature]
            f_min = np.min(feature_values)
            f_max = np.max(feature_values)
            # if all values are the same, skip this feature
            if f_min == f_max:
                continue
            # tries 10 random thresholds
            for _ in range(10):
                threshold = random.uniform(f_min, f_max)

                left_mask = feature_values < threshold
                # complement mask
                right_mask = ~left_mask

                # if either side of the split is empty, skip this threshold
                if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
                    continue

                gini_val = self.weighted_gini(labels[left_mask], labels[right_mask])
                # pretty self-explanatory
                if gini_val < best_gini:
                    best_gini = gini_val
                    best_split = (feature, threshold)

        # if no valid split is found, then it is a leaf
        if best_split is None:
            self.is_leaf = True
            return

        self.split_feature_index, self.split_value = best_split

        # recursive step
        # splits the data to recursively build its left and right branches
        left_mask = X[:, self.split_feature_index] < self.split_value
        right_mask = ~left_mask

        self.left_child = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
        self.left_child.fit(X[left_mask], labels[left_mask], depth + 1)

        self.right_child = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
        self.right_child.fit(X[right_mask], labels[right_mask], depth + 1)

    def gini(self, labels):
        """
        gini = 1 - sum(probability^2)
        """
        # computes typical Gini impurity
        m = len(labels)
        # if no samples, return 0
        if m == 0:
            return 0
        _, counts = np.unique(labels, return_counts=True)
        impurity = 1.0 - np.sum((counts / m) ** 2)
        return impurity

    def weighted_gini(self, left_labels, right_labels):
        # computes the weighted Gini impurity for a split
        m_left = len(left_labels)
        m_right = len(right_labels)
        m_total = m_left + m_right

        gini_left = self.gini(left_labels)
        gini_right = self.gini(right_labels)

        weighted_gini_left = (m_left / m_total) * gini_left
        weighted_gini_right = (m_right / m_total) * gini_right

        return weighted_gini_left + weighted_gini_right

    def predict(self, sample):
        # traverses the tree and makes a prediction
        if self.is_leaf:
            return self.prediction
        # depending on the comparison, the prediction is delegated to left or right child
        if sample[self.split_feature_index] < self.split_value:
            return self.left_child.predict(sample)
        else:
            return self.right_child.predict(sample)

class CustomRandomForest:
    def __init__(self, n_trees=100, sample_size=None, max_depth=10, min_samples_split=2, feature_subset_size=None):
        """
        n_trees: number of trees in the forest
        sample_size: number of samples to draw for each tree. If None, uses the full dataset.
        trees: stores all the decision trees in the random forest
        """
        self.n_trees = n_trees
        # bootstrap sample size for each tree
        self.sample_size = sample_size
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.feature_subset_size = feature_subset_size
        self.trees = []

    def fit(self, X, labels):
        num_samples, num_features = X.shape

        # uses full dataset if sample_size is not specified
        if self.sample_size is None:
            self.sample_size = num_samples
        # uses the square root heuristic for feature subset size if not specified
        if self.feature_subset_size is None:
            self.feature_subset_size = int(math.sqrt(num_features))

        self.trees = []
        # for each tree, a boostrap sample is created from the dataset
        # and a tree is trained on it and then added to the forest
        for _ in range(self.n_trees):
            # bootstrap sampling with replacement
            indices = np.random.choice(num_samples, self.sample_size, replace=True)
            X_sample = X[indices]
            labels_sample = labels[indices]

            tree = CustomRandomTree(self.max_depth, self.min_samples_split, self.feature_subset_size)
            tree.fit(X_sample, labels_sample)
            self.trees.append(tree)

    def predict(self, X):
        # gets predictions from all trees to return majority vote
        predictions = []
        for sample in X:
            tree_preds = []
            for tree in self.trees:
                tree_preds.append(tree.predict(sample))
            predictions.append(majority_vote(np.array(tree_preds)))
        return np.array(predictions)

def load_data(csv_file_path):
    if not os.path.exists(csv_file_path):
        raise FileNotFoundError(f"CSV file '{csv_file_path}' not found")
    
    df = pd.read_csv(csv_file_path)
    
    # separates is_fraud from the features
    y = df['is_fraud'].values
    x = df.drop(columns=['is_fraud']).values
    
    return x, y

def main():
    np.random.seed(42)
    random.seed(42)

    csv_file_path = 'data/100kDataPoints.csv'  # Update this path if necessary.

    x, y = load_data(csv_file_path)

    # shuffles and splits into training (70%) and testing (30%) sets
    num_samples = x.shape[0]
    indices = np.random.permutation(num_samples)
    split_idx = int(0.7 * num_samples)
    train_indices = indices[:split_idx]
    test_indices = indices[split_idx:]

    x_train, y_train = x[train_indices], y[train_indices]
    x_test, y_test = x[test_indices], y[test_indices]

    # trains the custom random forest
    rf = CustomRandomForest(n_trees=100, max_depth=10, min_samples_split=2)
    rf.fit(x_train, y_train)

    # makes predictions on the test set
    predictions = rf.predict(x_test)

    # computes evaluation metrics
    accuracy = np.mean(predictions == y_test)
    true_pos = np.sum((predictions == 1) & (y_test == 1))
    false_pos = np.sum((predictions == 1) & (y_test == 0))
    false_neg = np.sum((predictions == 0) & (y_test == 1))
    true_neg = np.sum((predictions == 0) & (y_test == 0))

    precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
    recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    # prints statistics
    print("Random Forest Accuracy: {:.2f}".format(accuracy))
    print("Precision: {:.2f}".format(precision))
    print("Recall: {:.2f}".format(recall))
    print("F1 Score: {:.2f}".format(f1))
    print("\nConfusion Matrix:")
    print("True Positives: {}".format(true_pos))
    print("False Positives: {}".format(false_pos))
    print("False Negatives: {}".format(false_neg))
    print("True Negatives: {}".format(true_neg))

if __name__ == "__main__":
    main()
