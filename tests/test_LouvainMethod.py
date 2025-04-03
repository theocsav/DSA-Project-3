import numpy as np

# tried to optimize the wikipedia version

class Graph:
    def __init__(self, graph):
        self.graph = graph

    def compute_total_weight(self, graph):
        total_weight = 0

        # go through each node and neighbors
        for node in graph:
            # add the weights of all edges from this node
            for neighbor in graph[node]:
                total_weight += graph[node][neighbor]
        
        # since each edge is counted twice, divide by 2
        return total_weight / 2.0
    
    def compute_degrees(self, graph):
        degrees = {}
        # loop through each node
        for node in graph:
            degree = 0
            for weight in graph[node].values():
                degree += weight
            degrees[node] = degree

        return degrees
    
    def move_nodes(self, graph, partition):
        m = self.compute_total_weight(graph)
        degrees = self.compute_degrees(graph)

        # initialize the sum of degrees for each community
        community_sum = {}
        for node, commmunity in partition.items():
            community_sum[commmunity] = community_sum.get(commmunity, 0) + degrees[node]

        improvement = True

        while improvement:
            improvement = False

            # iterate through all nodes
            for node in list(graph.keys()):
                current_community = partition[node]
                k_i = degrees[node]

                # determine candiate communities from neighbors
                candidate_weights = {}
                for neighbor, weight in graph[node].items():
                    community = partition[neighbor]
                    candidate_weights[community] = candidate_weights.get(community, 0) + weight

                if current_community not in candidate_weights:
                    candidate_weights[current_community] = 0

                # temporarily remove node from its community
                community_sum[current_community] -= k_i

                best_delta = 0
                best_community = current_community

                # what gain if moving node to each candidate community
                for community, k_i_in in candidate_weights.items():
                    # calculate the sum of weights from node to nodes in cadidate community
                    delta = k_i_in - (community_sum.get(community, 0) * k_i) / (2 * m)
                    if delta > best_delta:
                        best_delta = delta
                        best_community = community
                
                # if moving node improves modularity, update parition and community sums
                if best_community != current_community:
                    partition[node] = best_community
                    community_sum[best_community] = community_sum.get(best_community, 0) + k_i
                    improvement = True
                else:
                    # if not, add it back to its original community
                    community_sum[current_community] += k_i
        return partition

    def aggregate_graph(self, graph, partition):
        # based on the partition, each community becomes a new node
        # and edges are weighted by the sum of weights of edges between communities
        new_graph = {}

        communities = {}

        # build community membership
        for node, community in partition.items():
            if community not in communities:
                communities[community] = []
            communities[community].append(node)
        
        # each community beccomes a node
        for community in communities:
            new_graph[community] = {}

        # sum the weights of edges between communities
        for node in graph:
            for neighbor, weight in graph[node].items():
                community_node = partition[node]
                community_neighbor = partition[neighbor]
                if community_neighbor in new_graph[community_node]:
                    new_graph[community_node][community_neighbor] += weight
                else:
                    new_graph[community_node][community_neighbor] = weight

        return new_graph
    
    def singleton_partition(self, graph):
        # each node is its own community
        result = {}
        for node in graph:
            result[node] = node
        return result
    
    def run_louvain(self, graph):
        current_graph = self.graph
        partition = self.singleton_partition(current_graph)

        while True:
            # phase 1: local moving of nodes
            partition = self.move_nodes(current_graph, partition)
            # check if the partition is bad
            if len(set(partition.values())) == len(current_graph):
                break
            # phase 2: aggregate graph
            current_graph = self.aggregate_graph(current_graph, partition)
            # do partitioning for new graph
            partition = self.singleton_partition(current_graph)
        
        return partition
    
def build_similarity_graph(data, threshold):
    # data: numpy array of shape (n_samples, n_features)
    # threshold: if euclidean distance < threshold, an edge is created between them with weight = 1 / (1 + distance)
    n = data.shape[0]
    graph = {}
    for i in range(n):
        graph[i] = {}
    
    for i in range(n):
        for j in range(i + 1, n):
            distance = np.linalg.norm(data[i] - data[j])
            if distance < threshold:
                weight = 1.0 / (1 + distance)
                graph[i][j] = weight
                graph[j][i] = weight

    return graph

def print_graph_stats(graph):
    total_nodes = len(graph)
    # Count each edge once by summing degrees and dividing by 2.
    total_edges = sum(len(neighbors) for neighbors in graph.values()) // 2
    degrees = [len(neighbors) for neighbors in graph.values()]
    avg_degree = sum(degrees) / total_nodes if total_nodes > 0 else 0

    print(f"Total nodes: {total_nodes}")
    print(f"Total edges: {total_edges}")
    print(f"Average degree: {avg_degree:.2f}")

    # Print details for a few sample nodes.
    sample_nodes = list(graph.keys())[:min(5, total_nodes)]
    print("\nSample node details:")
    for node in sample_nodes:
        print(f"Node {node}: {graph[node]}")
    
# Demo code
if __name__ == "__main__":
    # Set random seed
    np.random.seed(42)
    
    # Generate normal data
    normal_count = 1000
    normal_data = np.random.normal(0, 1, size=(normal_count, 4))
    
    # Generate anomalies
    sketchy_count = 1000
    sketchy_data = np.random.normal(5, 2, size=(sketchy_count, 4))
    
    # Combine datasets
    all_transactions = np.vstack([normal_data, sketchy_data])
    true_labels = np.hstack([np.zeros(normal_count), np.ones(sketchy_count)])
    
    # Sample a subset cuz it's too large
    """
    sample_size = 300
    indices = np.random.choice(len(all_transactions), size=sample_size, replace=False)
    sample_data = all_transactions[indices]
    sample_true_labels = true_labels[indices]"
    """
    sample_data = all_transactions
    sample_true_labels = true_labels
    
    # build similarity graph
    threshold = 2.0
    similarity_graph = build_similarity_graph(sample_data, threshold)
    print_graph_stats(similarity_graph)
    
    # run louvain method on similarity graph
    louvain = Graph(similarity_graph)
    partition = louvain.run_louvain(similarity_graph)

    # organize nodes by community
    communities = {}
    for node, community in partition.items():
        if community not in communities:
            communities[community] = []
        communities[community].append(node)

    
    # Calculate metrics
    print("\nDetected Communities and Fraud Counts:")
    for community, nodes in communities.items():
        total = len(nodes)
        fraud_count = sum(sample_true_labels[node] for node in nodes)
        normal_count = total - fraud_count
        print(f"Community {community}: Total nodes = {total}, Normal = {normal_count}, Fraudulent = {fraud_count}")
