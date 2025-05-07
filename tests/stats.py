import numpy as np
import pandas as pd
import random
import matplotlib.pyplot as plt
from sklearn.model_selection import KFold
from scipy.stats import f_oneway, ttest_ind
import itertools

from test_IsolationForest import IsolationForest 
from test_RandomForest import CustomRandomForest

def compute_classification_metrics(predictions, true_labels):
    accuracy = np.mean(predictions == true_labels)
    true_pos = np.sum((predictions == 1) & (true_labels == 1))
    false_pos = np.sum((predictions == 1) & (true_labels == 0))
    false_neg = np.sum((predictions == 0) & (true_labels == 1))

    precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
    recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return accuracy, precision, recall, f1

def load_data(csv_file_path):
    df = pd.read_csv(csv_file_path)
    x = df.drop(columns=['is_fraud']).values
    y = df['is_fraud'].values
    return x, y

def train_random_forest(X_train, y_train, X_test, n_trees=100, max_depth=10):
    model = CustomRandomForest(n_trees=n_trees, max_depth=max_depth)
    model.fit(X_train, y_train)
    return model.predict(X_test)

def train_isolation_forest(X_train, y_train, X_test, threshold=0.55):
    model = IsolationForest(tree_count=120, sample_size=256)
    model.plant_forest(X_train)
    scores = model.get_all_scores(X_test)
    return (scores >= threshold).astype(int)

def run_cross_validation(csv_file_path):
    np.random.seed(42)
    random.seed(42)

    x, y = load_data(csv_file_path)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    configs = {
        'Config 1 (RF 100)': lambda X_train, y_train, X_test: train_random_forest(X_train, y_train, X_test, 100),
        'Config 2 (RF 150)': lambda X_train, y_train, X_test: train_random_forest(X_train, y_train, X_test, 150),
        'Config 3 (IF 0.50)': lambda X_train, y_train, X_test: train_isolation_forest(X_train, y_train, X_test, 0.50),
        'Config 4 (IF 0.55)': lambda X_train, y_train, X_test: train_isolation_forest(X_train, y_train, X_test, 0.55),
        'Config 5 (IF 0.65)': lambda X_train, y_train, X_test: train_isolation_forest(X_train, y_train, X_test, 0.65)
    }

    all_metrics = {cfg: {'accuracy': [], 'precision': [], 'recall': [], 'f1': []} for cfg in configs}

    for fold, (train_idx, test_idx) in enumerate(kf.split(x)):
        print(f"Fold {fold+1}/5")
        X_train, X_test = x[train_idx], x[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        for name, func in configs.items():
            preds = func(X_train, y_train, X_test)
            acc, prec, rec, f1 = compute_classification_metrics(preds, y_test)
            all_metrics[name]['accuracy'].append(acc)
            all_metrics[name]['precision'].append(prec)
            all_metrics[name]['recall'].append(rec)
            all_metrics[name]['f1'].append(f1)

    return all_metrics

def analyze_and_plot(all_metrics):
    metrics = ['accuracy', 'precision', 'recall', 'f1']
    configs = list(all_metrics.keys())

    print("\nCross-validation Results (mean ± std):")
    for config in configs:
        for metric in metrics:
            mean = np.mean(all_metrics[config][metric])
            std = np.std(all_metrics[config][metric])
            print(f"{config} - {metric}: {mean:.3f} ± {std:.3f}")

    for metric in metrics:
        print(f"\nANOVA for {metric.capitalize()}:")
        f_stat, p_val = f_oneway(*[all_metrics[cfg][metric] for cfg in configs])
        print(f"F-statistic: {f_stat:.3f}")
        print(f"p-value: {p_val:.5f}")

        print(f"\nBonferroni-corrected pairwise t-tests for {metric.capitalize()}:")
        pval_matrix = pd.DataFrame('-', index=configs, columns=configs)
        comparisons = list(itertools.combinations(configs, 2))
        bonf_alpha = 0.05 / len(comparisons)

        for c1, c2 in comparisons:
            _, p = ttest_ind(all_metrics[c1][metric], all_metrics[c2][metric], equal_var=False)
            pval_matrix.loc[c1, c2] = f"{p:.5f}" + ("*" if p < bonf_alpha else "")

        print(pval_matrix)
        pval_matrix.to_csv(f"bonferroni_ttests_{metric}.csv")

    fig, axs = plt.subplots(1, 4, figsize=(20, 6))
    for idx, metric in enumerate(metrics):
        means = [np.mean(all_metrics[c][metric]) for c in configs]
        stds = [np.std(all_metrics[c][metric]) for c in configs]
        axs[idx].bar(configs, means, yerr=stds, capsize=4)
        axs[idx].set_title(metric.capitalize())
        axs[idx].set_ylim(0, 1)
        axs[idx].tick_params(axis='x', rotation=25)
        axs[idx].grid(True)

    plt.tight_layout()
    plt.savefig("metrics_barplot.png", dpi=300)
    plt.show()

if __name__ == "__main__":
    csv_path = "../data/100kDataPoints.csv" 
    metrics = run_cross_validation(csv_path)
    analyze_and_plot(metrics)
