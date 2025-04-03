import numpy as np

# wikipedia version
# seems to recompute modularity for each node, which is inefficient
# at 300 nodes, it takes around 12 minutes to run. I got a trash laptop tho
class Graph:
    def __init__(self, graph):
        self.graph = graph

    def compute_modularity(self, graph, partition):
        # Q = sum_C [ (sum_in/(2m)) - (sum_tot/(2m))^2 ]
        # where m is the total weight of edges
        # sum_in is the total weight of edges inside community C
        # sum_tot is the sum of degrees of nodes in C

        # total edge weight (counted once)
        m = 0
        for node, neighbors in graph.items():
            m += sum(neighbors.values())
        m /= 2.0

        # compute degree for each node
        degrees = {}
        for node, neighbors in graph.items():
            total = 0
            for weight in neighbors.values():
                total += weight
            degrees[node] = total

        # build community membership
        communities = {}
        for node, community in partition.items():
            if community not in communities:
                communities[community] = []
            communities[community].append(node)
        
        Q = 0.0
        for community_nodes in communities.values():
            sum_in = 0.0
            sum_tot = 0.0
            for node in community_nodes:
                sum_tot += degrees[node]
                for neighbor, weight in graph[node].items():
                    if partition[neighbor] == partition[node]:
                        sum_in += weight
            # sum_in is counted twice (once for each node in the community)
            Q += (sum_in / (2 * m)) - ((sum_tot / (2 * m)) ** 2)
        return Q
    
    def move_nodes(self, graph, partition):
        # for each node, try to move it to a community that gives it maximum gain in modularity
        # repeat until no node can be moved to increase modularity
        improvement = True
        current_modularity = self.compute_modularity(graph, partition)

        while improvement:
            improvement = False

            for node in list(graph.keys()):
                current_community = partition[node]
                best_community = current_community
                best_delta = 0.0

                # try other communities and then put it in the best one
                candidate_communities = set()
                for neighbor in graph[node]:
                    candidate_communities.add(partition[neighbor])
                # also include its current community in case no move is beneficial
                candidate_communities.add(current_community)

                # try moving node to each candidate community and compute delta modularity
                for community in candidate_communities:
                    # save current community and try candidate
                    original_community = partition[node]
                    partition[node] = community
                    new_modularity = self.compute_modularity(graph, partition)
                    delta = new_modularity - current_modularity
                    if delta > best_delta:
                        best_delta = delta
                        best_community = community
                    # revert to original community
                    partition[node] = original_community

                # if a move improves modularity, do it
                if best_community != current_community and best_delta > 0:
                    partition[node] = best_community
                    current_modularity += best_delta
                    improvement = True

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
            if(len(set(partition.values())) == len(current_graph)):
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
    normal_count = 1000000
    normal_data = np.random.normal(0, 1, size=(normal_count, 4))
    
    # Generate anomalies
    sketchy_count = 1000
    sketchy_data = np.random.normal(5, 2, size=(sketchy_count, 4))
    
    # Combine datasets
    all_transactions = np.vstack([normal_data, sketchy_data])
    true_labels = np.hstack([np.zeros(normal_count), np.ones(sketchy_count)])
    
    # Sample a subset cuz it's too large
    sample_size = 300
    indices = np.random.choice(len(all_transactions), size=sample_size, replace=False)
    sample_data = all_transactions[indices]
    sample_true_labels = true_labels[indices]
    
    # build similarity graph
    threshold = 4.0
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
    for comm, nodes in communities.items():
        total = len(nodes)
        fraud_count = sum(sample_true_labels[node] for node in nodes)
        normal_count = total - fraud_count
        print(f"Community {comm}: Total nodes = {total}, Normal = {normal_count}, Fraudulent = {fraud_count}")
