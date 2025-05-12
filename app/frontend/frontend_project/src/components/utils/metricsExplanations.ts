interface MetricExplanation {
    title: string;
    description: string;
    impact: string;
    financialContext?: string;
    calculation: string;
  }
  
  /**
   * Utility function to get explanations and financial context for various metrics
   */
  export const getMetricExplanation = (
    metric: string, 
    value: number, 
    avgFraudValue: number = 1000
  ): MetricExplanation => {
    switch(metric) {
      case 'accuracy':
        return {
          title: 'Accuracy',
          description: 'The percentage of all predictions (both fraud and non-fraud) that are correct.',
          impact: `High accuracy alone doesn't guarantee good fraud detection – in an imbalanced dataset with few fraud cases, a model could have high accuracy by always predicting "not fraud".`,
          calculation: 'Accuracy = (True Positives + True Negatives) / Total Transactions'
        };
      case 'precision':
        return {
          title: 'Precision',
          description: 'The percentage of transactions flagged as fraud that are actually fraudulent.',
          impact: `With ${(value * 100).toFixed(1)}% precision, of every 100 transactions the model flags as fraud, ${Math.round(value * 100)} are truly fraudulent and ${Math.round((1-value) * 100)} are legitimate transactions that were incorrectly flagged.`,
          financialContext: `Each false positive may cost ~$25 in investigation time and potential customer friction. At current precision, this represents approximately $${Math.round((1-value) * 100 * 25)} cost per 100 fraud alerts.`,
          calculation: 'Precision = True Positives / (True Positives + False Positives)'
        };
      case 'recall':
        return {
          title: 'Recall (Detection Rate)',
          description: 'The percentage of all actual fraud transactions that are correctly detected.',
          impact: `With ${(value * 100).toFixed(1)}% recall, the model catches ${Math.round(value * 100)} out of every 100 fraud attempts, but misses ${Math.round((1-value) * 100)}.`,
          financialContext: `At an average fraud value of $${avgFraudValue}, the missed fraud costs approximately $${Math.round((1-value) * 100 * avgFraudValue)} per 100 fraud attempts.`,
          calculation: 'Recall = True Positives / (True Positives + False Negatives)'
        };
      case 'f1_score':
        return {
          title: 'F1 Score',
          description: 'The harmonic mean of precision and recall, providing a balance between them.',
          impact: 'F1 score helps balance the trade-off between false positives and false negatives, especially important in fraud detection where both have financial consequences.',
          calculation: 'F1 Score = 2 × (Precision × Recall) / (Precision + Recall)'
        };
      case 'falsePositiveRate':
        return {
          title: 'False Positive Rate',
          description: 'The percentage of legitimate transactions incorrectly flagged as fraud.',
          impact: `With a ${(value * 100).toFixed(1)}% false positive rate, ${Math.round(value * 100)} out of every 100 legitimate transactions are incorrectly flagged as fraud.`,
          financialContext: `These false positives can damage customer relationships and waste investigative resources. Approximate cost: $${Math.round(value * 100 * 25)} per 100 legitimate transactions in operational costs.`,
          calculation: 'False Positive Rate = False Positives / (False Positives + True Negatives)'
        };
      case 'falseNegativeRate':
        return {
          title: 'False Negative Rate',
          description: 'The percentage of fraudulent transactions that are missed by the model.',
          impact: `With a ${(value * 100).toFixed(1)}% false negative rate, ${Math.round(value * 100)} out of every 100 fraud attempts go undetected.`,
          financialContext: `Direct financial impact of missed fraud: approximately $${Math.round((1-value) * 100 * avgFraudValue)} per 100 fraud attempts, based on average fraud value.`,
          calculation: 'False Negative Rate = False Negatives / (False Negatives + True Positives)'
        };
      default:
        return {
          title: 'Metric Information',
          description: 'No specific information available for this metric.',
          impact: '',
          calculation: ''
        };
    }
  };
  
  export default getMetricExplanation;