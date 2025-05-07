import matplotlib.pyplot as plt
import numpy as np

# Set global font to Times New Roman to match IEEE style
plt.rcParams["font.family"] = "Times New Roman"

# Data from Table II
configs = ["RF 100", "RF 150", "IF 0.50", "IF 0.55", "IF 0.65"]
x = np.arange(len(configs))

accuracy_mean = [0.985, 0.986, 0.587, 0.931, 0.925]
accuracy_std = [0.001, 0.001, 0.019, 0.005, 0.002]

precision_mean = [0.977, 0.976, 0.141, 0.538, 0.700]
precision_std = [0.003, 0.004, 0.004, 0.040, 0.400]

recall_mean = [0.823, 0.828, 0.882, 0.568, 0.002]
recall_std = [0.007, 0.008, 0.009, 0.014, 0.002]

f1_mean = [0.893, 0.896, 0.243, 0.551, 0.003]
f1_std = [0.004, 0.005, 0.005, 0.019, 0.004]

metrics = [
    ("(a) Accuracy", accuracy_mean, accuracy_std),
    ("(b) Precision", precision_mean, precision_std),
    ("(c) Recall", recall_mean, recall_std),
    ("(d) F1 Score", f1_mean, f1_std),
]

colors = ['#1f77b4', '#2ca02c', '#d62728', '#9467bd']

# Create a single-row subplot
fig, axs = plt.subplots(1, 4, figsize=(16, 4))
axs = axs.flatten()

label_fontsize = 14
title_fontsize = 16
tick_fontsize = 14  # Increased tick font size

for i, (title, mean, std) in enumerate(metrics):
    bars = axs[i].bar(x, mean, yerr=std, capsize=5, color=colors[i], edgecolor="black", linewidth=1)
    axs[i].errorbar(x, mean, yerr=std, fmt='none', ecolor='black', capsize=5, elinewidth=1, capthick=1)
    
    axs[i].set_xticks(x)
    axs[i].set_xticklabels(configs, fontsize=tick_fontsize, rotation=30, ha="right")
    axs[i].set_title(title, fontsize=title_fontsize, fontweight='bold')
    axs[i].tick_params(axis='y', labelsize=tick_fontsize)
    axs[i].set_ylabel('Score', fontsize=label_fontsize, fontweight='bold')
    axs[i].set_ylim(0, 1.05)

    axs[i].spines['top'].set_visible(False)
    axs[i].spines['right'].set_visible(False)
    axs[i].yaxis.grid(True, linestyle='--', linewidth=0.5, color='gray')
    axs[i].set_axisbelow(True)

plt.tight_layout(w_pad=2.5)
plt.savefig("model_performance_horizontal_larger_ticks.png", dpi=300)
plt.show()
