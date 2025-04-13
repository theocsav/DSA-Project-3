import numpy as np
from collections import defaultdict
import time

class Louvain:
    def __init__(self, graph):
        self.graph = graph
        self.total_weight = self._compute_total_weight()
        self.degrees = self._compute_degrees()

    def _compute_total_weight(self):
        #find the total edge weight
        return sum(sum(neighbors.values()) for node, neighbors in self.graph.items()) / 2.0

    def _compute_degrees(self):
        #Prefind weighted degree of each node.
        return {node: sum(neighbors.values()) for node, neighbors in self.graph.items()}

    def move_nodes_fast(self, partition):
        #Moves through nodes with connection caching and early stopping."
        graph = self.graph
        degrees = self.degrees
        m = self.total_weight

        # Cache community weights
        community_sum = defaultdict(float)
        for node, community in partition.items():
            community_sum[community] += degrees[node]

        # Cache node connections to communities
        node_connections = {}
        for node in graph:
            connections = defaultdict(float)
            for neighbor, weight in graph[node].items():
                connections[partition[neighbor]] += weight
            node_connections[node] = connections

        # Process nodes by degree
        nodes_by_degree = sorted(graph.keys(), key=lambda n: degrees[n], reverse=True)

        moves_made = 0
        max_iterations = 2  # limit iterations for speed CAN BE CHANGED BUT WILL BE SLOWER. 
                            # 2 iteration

        for iteration in range(max_iterations):
            iteration_moves = 0

            for node in nodes_by_degree:
                current_community = partition[node]
                node_degree = degrees[node]
                connections = node_connections[node]

                # Temporarily remove node from its community
                community_sum[current_community] -= node_degree

                # Find best community (only consider connected communities)
                best_gain = 0
                best_community = current_community

                for community, weight_to_community in connections.items():
                    # Skip empty connections or self-community
                    if weight_to_community <= 0:
                        continue

                    gain = weight_to_community - (community_sum[community] * node_degree) / (2 * m)
                    if gain > best_gain:
                        best_gain = gain
                        best_community = community

                # Move node if beneficial
                if best_community != current_community:
                    # Update community assignment
                    partition[node] = best_community
                    community_sum[best_community] += node_degree
                    iteration_moves += 1

                    # Update connections for neighbors (critical for correctness)
                    for neighbor in graph[node]:
                        # Update connection to old community
                        neighbor_conns = node_connections[neighbor]
                        weight = graph[node][neighbor]
                        neighbor_conns[current_community] -= weight

                        # Update connection to new community
                        neighbor_conns[best_community] += weight
                else:
                    # Add node back to original community
                    community_sum[current_community] += node_degree

            moves_made += iteration_moves
            if iteration_moves < 10:  # Stop early if few moves
                break

        return partition, moves_made > 0

    def aggregate_graph(self, partition):
        """Fast graph aggregation."""
        graph = self.graph

        # Map communities to consecutive integers
        unique_communities = sorted(set(partition.values()))
        community_map = {comm: i for i, comm in enumerate(unique_communities)}

        # Group nodes by community
        community_nodes = defaultdict(list)
        for node, community in partition.items():
            community_nodes[community].append(node)

        # Create aggregated graph
        new_graph = defaultdict(lambda: defaultdict(float))

        # Aggregate edges in a single pass
        for old_comm, nodes in community_nodes.items():
            new_comm = community_map[old_comm]

            # Collect all connections from this community
            for node in nodes:
                for neighbor, weight in graph[node].items():
                    neighbor_comm = community_map[partition[neighbor]]
                    new_graph[new_comm][neighbor_comm] += weight

        # Convert to regular dict
        result_graph = {k: dict(v) for k, v in new_graph.items()}

        # Create mapping from original nodes to new communities
        node_mapping = {node: community_map[comm] for node, comm in partition.items()}

        return result_graph, node_mapping

    def run(self, max_passes=3):
        """Run algorithm with hard limits on passes."""
        current_graph = self.graph
        current_louvain = self

        # Initialize each node in its own community
        partition = {node: node for node in current_graph.keys()}
        node_to_community = partition.copy()

        for pass_count in range(max_passes):
            # Phase 1: Move nodes
            partition, improved = current_louvain.move_nodes_fast(partition)
            if not improved:
                break

            # Phase 2: Aggregate graph
            new_graph, node_mapping = current_louvain.aggregate_graph(partition)

            # Update mapping from original nodes to communities
            for node, old_comm in node_to_community.items():
                node_to_community[node] = node_mapping[old_comm]

            # Stop if no more aggregation possible
            if len(new_graph) == len(current_graph):
                break

            # Prepare for next pass
            current_graph = new_graph
            current_louvain = Louvain(current_graph)
            partition = {node: node for node in current_graph}

        return node_to_community

def build_grid_index(data, threshold):
    """Build a grid-based spatial index for fast neighbor finding."""
    n_samples, n_features = data.shape

    # Determine cell size based on threshold
    cell_size = threshold

    # Create grid
    grid = defaultdict(list)

    # Insert points into grid
    for i in range(n_samples):
        # Calculate grid cell coordinates
        cell_coords = tuple(int(val // cell_size) for val in data[i])
        grid[cell_coords].append(i)

    return grid

def build_similarity_graph_grid(data, threshold):
    """Build similarity graph using grid-based spatial indexing."""
    n_samples, n_features = data.shape
    start_time = time.time()

    # Create grid index
    grid = build_grid_index(data, threshold)
    print(f"Grid index built in {time.time() - start_time:.2f} seconds with {len(grid)} cells")

    # Initialize graph
    graph = {i: {} for i in range(n_samples)}

    # Define neighbor cell offsets (adjacent cells in n-dimensional space)
    # Only need to check half of the neighbors due to symmetry
    offsets = []
    for i in range(3**n_features):
        offset = []
        temp = i
        for _ in range(n_features):
            offset.append(temp % 3 - 1)  # -1, 0, or 1
            temp //= 3
        offsets.append(tuple(offset))

    # Find edges between neighboring cells
    edge_count = 0
    edge_comparisons = 0
    start_time = time.time()

    # Process in batches to show progress
    cell_count = len(grid)
    batch_size = max(1, cell_count // 10)

    cells_processed = 0
    for cell_coords, points in grid.items():
        # For each point in this cell
        for i in points:
            point_i = data[i]

            # Check neighboring cells
            for offset in offsets:
                neighbor_coords = tuple(c + o for c, o in zip(cell_coords, offset))

                if neighbor_coords in grid:
                    # Compare with points in the neighboring cell
                    for j in grid[neighbor_coords]:
                        if i >= j:  # Skip duplicate comparisons
                            continue

                        edge_comparisons += 1
                        dist = np.linalg.norm(point_i - data[j])

                        if dist < threshold:
                            weight = 1.0 / (1 + dist)
                            graph[i][j] = weight
                            graph[j][i] = weight
                            edge_count += 1

        cells_processed += 1
        if cells_processed % batch_size == 0:
            progress = cells_processed / cell_count * 100
            print(f"Grid search progress: {progress:.1f}% - Found {edge_count} edges")

    print(f"Graph built: {edge_count} edges from {edge_comparisons} comparisons in {time.time() - start_time:.2f} seconds")
    return graph

def sample_data_if_large(data, true_labels, max_samples=10000):
    """Randomly sample data if too large."""
    if len(data) <= max_samples:
        return data, true_labels

    # Sample randomly
    np.random.seed(42)
    indices = np.random.choice(len(data), max_samples, replace=False)
    return data[indices], true_labels[indices]

def reduce_dimensions(data, target_dims=4):
    """Simple dimensionality reduction to speed up distance calculations."""
    if data.shape[1] <= target_dims:
        return data

    # Use random projection for dimensionality reduction
    np.random.seed(42)
    projection = np.random.randn(data.shape[1], target_dims)
    # Normalize columns to preserve distances approximately
    projection = projection / np.sqrt(np.sum(projection**2, axis=0))
    return np.dot(data, projection)

# Main function
if __name__ == "__main__":
    # Set random seed
    np.random.seed(42)

    print("Generating synthetic data...")
    # Generate normal data
    normal_count = 5000
    normal_data = np.random.normal(0, 1, size=(normal_count, 4))

    # Generate anomalies
    sketchy_count = 5000
    sketchy_data = np.random.normal(5, 2, size=(sketchy_count, 4))

    # Combine datasets
    all_transactions = np.vstack([normal_data, sketchy_data])
    true_labels = np.hstack([np.zeros(normal_count), np.ones(sketchy_count)])

    # Sample if dataset is very large
    data, labels = sample_data_if_large(all_transactions, true_labels)
    print(f"Working with {len(data)} data points, {data.shape[1]} dimensions")

    # Dimensionality reduction if needed
    if data.shape[1] > 4:
        data = reduce_dimensions(data)
        print(f"Reduced dimensions to {data.shape[1]}")

    # Build graph
    start_time = time.time()
    threshold = 2.0
    similarity_graph = build_similarity_graph_grid(data, threshold)
    graph_time = time.time() - start_time

    print(f"Graph statistics:")
    total_nodes = len(similarity_graph)
    total_edges = sum(len(neighbors) for neighbors in similarity_graph.values()) // 2
    avg_degree = total_edges * 2 / total_nodes if total_nodes > 0 else 0
    print(f"  Nodes: {total_nodes}, Edges: {total_edges}, Avg degree: {avg_degree:.2f}")

    # Run community detection
    print("\nRunning community detection...")
    start_time = time.time()
    louvain = Louvain(similarity_graph)
    partition = louvain.run(max_passes=3)  # Limited passes for speed
    detection_time = time.time() - start_time
    print(f"Community detection completed in {detection_time:.2f} seconds")

    # Organize nodes by community
    communities = defaultdict(list)
    for node, community in partition.items():
        communities[community].append(node)

    # Calculate metrics
    print("\nDetected Communities and Fraud Counts:")
    for community, nodes in sorted(communities.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        total = len(nodes)
        fraud_count = sum(labels[node] for node in nodes)
        normal_count = total - fraud_count
        fraud_percent = (fraud_count / total) * 100
        print(f"Community {community}: Total={total}, Normal={normal_count}, Fraud={fraud_count}, Fraud%={fraud_percent:.1f}%")

    print(f"\nTotal communities: {len(communities)}")
    print(f"Total processing time: {graph_time + detection_time:.2f} seconds")