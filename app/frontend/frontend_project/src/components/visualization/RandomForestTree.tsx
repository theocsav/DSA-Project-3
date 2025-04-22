import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import TreeVisualization from './TreeVisualization';
import { TreeNode, TreeVisualizationProps, COLORS, TREE_CONSTANTS } from './types';
import { useRandomForestAnalysis } from '../../api/queries';

// Component implementation
const RandomForestTree = forwardRef<HTMLDivElement, TreeVisualizationProps>((props, ref) => {
  const { thresholds, onComplete, autoStart = false } = props;
  
  // State
  const [animationActive, setAnimationActive] = useState<boolean>(autoStart);
  const [currentTree, setCurrentTree] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true); // Database connectivity check
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const treeDataRef = useRef<TreeNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // API mutation hook
  const randomForestMutation = useRandomForestAnalysis();
  
  // SVG dimensions and tree layout parameters
  const width = 600;
  const height = 400;
  const nodeRadius = TREE_CONSTANTS.NODE_RADIUS;
  const levelHeight = TREE_CONSTANTS.LEVEL_HEIGHT;
  const maxDepth = thresholds.max_tree_depth || TREE_CONSTANTS.MAX_DEPTH;

  // Draw a single node in the SVG
  const drawNode = useCallback((node: TreeNode) => {
    if (!svgRef.current) return;
    
    // Create node group (<g>) element
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodeGroup.setAttribute('id', `node-${node.id}`);
    nodeGroup.setAttribute('transform', `translate(${node.x},${node.y})`);
    
    // Create node circle (<circle>) element
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('r', String(nodeRadius));
    
    // Determine fill color based on fraud ratio and sample size
    let fillColor = COLORS.NORMAL; // Default to normal
    if (node.samples === 1) {
        fillColor = node.fraudRatio > 0 ? COLORS.FRAUD : COLORS.NORMAL;
    } else if (node.fraudRatio > 0) {
        fillColor = node.fraudRatio > 0.5 ? COLORS.FRAUD : COLORS.MIXED;
    }
    
    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', COLORS.NODE_STROKE);
    circle.setAttribute('stroke-width', '2'); // Thicker stroke for better visibility
    
    // Add circle to the group
    nodeGroup.appendChild(circle);
    
    // Add sample count text (<text>) inside the node
    const sampleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    sampleText.setAttribute('dy', '0.3em'); // Vertical alignment
    sampleText.setAttribute('text-anchor', 'middle'); // Horizontal alignment
    sampleText.setAttribute('font-size', `${TREE_CONSTANTS.TEXT_SIZE}px`); // Use larger text size from constants
    sampleText.setAttribute('font-weight', 'bold'); // Make text bold for better visibility
    sampleText.setAttribute('fill', '#FFFFFF'); // White text for better contrast on colored circles
    sampleText.textContent = String(node.samples);
    nodeGroup.appendChild(sampleText);
    
    // Add the complete group to the SVG
    svgRef.current.appendChild(nodeGroup);
  }, [nodeRadius]);

  // Draw a connection line between parent and child nodes
  const drawConnection = useCallback((parentNode: TreeNode, childNode: TreeNode) => {
    if (!svgRef.current) return;
    
    // Create line (<line>) element
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', String(parentNode.x));
    line.setAttribute('y1', String(parentNode.y));
    line.setAttribute('x2', String(childNode.x));
    line.setAttribute('y2', String(childNode.y));
    line.setAttribute('stroke', COLORS.CONNECTION);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('id', `link-${parentNode.id}-to-${childNode.id}`);
    
    // Insert the line at the beginning of the SVG elements (so nodes are drawn on top)
    svgRef.current.insertBefore(line, svgRef.current.firstChild);
  }, []);

  // Highlight the split line and add feature text instead of using circles
  const highlightNode = useCallback((node: TreeNode, feature: string, splitValue: number) => {
    if (!svgRef.current) return;
    
    // Find the node's group element by ID
    const nodeGroup = document.getElementById(`node-${node.id}`);
    if (!nodeGroup) return;
    
    // Clean up previous highlights if any
    const existingTexts = nodeGroup.querySelectorAll('.highlight-text');
    existingTexts.forEach(text => text.remove());
    
    // Find the connection lines to children
    const leftChild = node.left;
    const rightChild = node.right;
    if (!leftChild || !rightChild) return;
    
    // Get the connection lines
    const leftLine = document.getElementById(`link-${node.id}-to-${leftChild.id}`);
    const rightLine = document.getElementById(`link-${node.id}-to-${rightChild.id}`);
    
    if (leftLine) {
        leftLine.setAttribute('stroke', COLORS.SPLIT_LINE);
        leftLine.setAttribute('stroke-width', '3');
        
        // Animation to revert back after some time
        setTimeout(() => {
            leftLine.setAttribute('stroke', COLORS.CONNECTION);
            leftLine.setAttribute('stroke-width', '2');
        }, 1500);
    }
    
    if (rightLine) {
        rightLine.setAttribute('stroke', COLORS.SPLIT_LINE);
        rightLine.setAttribute('stroke-width', '3');
        
        // Animation to revert back after some time
        setTimeout(() => {
            rightLine.setAttribute('stroke', COLORS.CONNECTION);
            rightLine.setAttribute('stroke-width', '2');
        }, 1500);
    }
    
    // Add feature text above the node
    const featureText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    featureText.setAttribute('dy', '-1.8em'); // Position above the node (moved up slightly)
    featureText.setAttribute('text-anchor', 'middle');
    featureText.setAttribute('font-size', `${TREE_CONSTANTS.FEATURE_TEXT_SIZE}px`);
    featureText.setAttribute('fill', COLORS.SPLIT_TEXT);
    featureText.setAttribute('stroke', '#000'); // Black outline for better visibility
    featureText.setAttribute('stroke-width', '0.7'); // Thicker outline
    featureText.setAttribute('paint-order', 'stroke'); // Make the stroke appear behind the text
    featureText.setAttribute('font-weight', 'bold'); // Make text bold
    featureText.classList.add('highlight-text'); // Add class for potential cleanup
    
    // Abbreviate feature name if needed
    const shortFeature = feature.substring(0, Math.min(feature.length, 3));
    featureText.textContent = `${shortFeature}:${splitValue.toFixed(1)}`;
    
    // Append the feature text to the group
    nodeGroup.appendChild(featureText);
    
    // Fade out animation using timeouts
    let opacity = 1.0;
    const fadeInterval = setInterval(() => {
        opacity -= 0.1;
        if (opacity <= 0) {
            clearInterval(fadeInterval);
            if (featureText.parentNode) featureText.remove(); 
        } else {
            featureText.setAttribute('fill-opacity', String(opacity));
        }
    }, 150);
  }, []);

  // Find all leaf nodes in the current tree
  const findLeafNodes = useCallback((node: TreeNode | null, results: TreeNode[] = []): TreeNode[] => {
    if (!node) return results;
    
    if (!node.left && !node.right) {
      // This is a leaf node
      results.push(node);
    } else {
      // Recursively search in children
      if (node.left) findLeafNodes(node.left, results);
      if (node.right) findLeafNodes(node.right, results);
    }
    
    return results;
  }, []);

  // Generate the initial root node for a new tree
  const generateTree = useCallback((): TreeNode | null => {
    if (!svgRef.current) return null;
    
    // Clear previous SVG content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    
    // Create the root node
    const rootNode: TreeNode = { 
      id: 'root', 
      depth: 0, 
      x: width / 2, 
      y: 30,
      samples: Math.floor(Math.random() * 15) + 20, // Random sample size (20-34)
      fraudRatio: Math.random() * 0.25 // Random initial fraud ratio (0% - 25%)
    };
    
    // Draw the root node
    drawNode(rootNode);
    
    treeDataRef.current = rootNode; // Store the root node
    return rootNode;
  }, [drawNode, width]);

  // Advance the tree growth by splitting a leaf node
  const advanceTree = useCallback(() => {
    const currentTreeRoot = treeDataRef.current;
    if (!currentTreeRoot) return;

    // Choose a random feature to split on
    const features = ['amt', 'distance_km', 'age', 'trans_hour', 'category', 'job'];
    const featureIndex = Math.floor(Math.random() * features.length);
    const feature = features[featureIndex];
    setCurrentFeature(feature);
    
    // Find all current leaf nodes
    const leafNodes = findLeafNodes(currentTreeRoot);
    
    if (leafNodes.length === 0) return;
    
    // Filter leaf nodes that are eligible for splitting
    const eligibleNodes = leafNodes.filter(node => node.depth < maxDepth - 1);
    
    if (eligibleNodes.length === 0) {
        setCurrentFeature(prev => 
            (prev && prev.includes('(max depth)')) ? prev : (prev ? `${prev} (max depth)`: '(max depth)')
        );
        return; 
    }
    
    // Select a random eligible leaf node to split
    const nodeToSplit = eligibleNodes[Math.floor(Math.random() * eligibleNodes.length)];
    
    // Create a random split value
    const splitValue = Math.floor(Math.random() * 100);
    nodeToSplit.feature = feature;
    nodeToSplit.splitValue = splitValue;
    
    // Simulate distributing samples to children
    const leftRatio = 0.3 + Math.random() * 0.4; // Random ratio between 0.3 and 0.7
    const leftSamples = Math.max(1, Math.floor(nodeToSplit.samples * leftRatio));
    const rightSamples = Math.max(1, nodeToSplit.samples - leftSamples);
    
    // Simulate distributing fraud samples
    const totalFraudSamples = Math.floor(nodeToSplit.samples * nodeToSplit.fraudRatio);
    const leftFraudRatio = Math.max(0, Math.min(1, nodeToSplit.fraudRatio + (Math.random() - 0.5) * 0.2));
    const leftFraudSamples = Math.min(leftSamples, Math.max(0, Math.floor(leftSamples * leftFraudRatio)));
    const rightFraudSamples = Math.min(rightSamples, Math.max(0, totalFraudSamples - leftFraudSamples));

    // Calculate fraud ratios for children
    const leftChildFraudRatio = leftSamples > 0 ? leftFraudSamples / leftSamples : 0;
    const rightChildFraudRatio = rightSamples > 0 ? rightFraudSamples / rightSamples : 0;

    // Create child nodes
    const leftNode: TreeNode = {
      id: `${nodeToSplit.id}-0`,
      depth: nodeToSplit.depth + 1,
      // Calculate position based on parent and depth
      x: nodeToSplit.x - (width / Math.pow(2, nodeToSplit.depth + 2)), 
      y: nodeToSplit.y + levelHeight,
      samples: leftSamples,
      fraudRatio: leftChildFraudRatio,
      parent: nodeToSplit
    };
    
    const rightNode: TreeNode = {
      id: `${nodeToSplit.id}-1`,
      depth: nodeToSplit.depth + 1,
      x: nodeToSplit.x + (width / Math.pow(2, nodeToSplit.depth + 2)),
      y: nodeToSplit.y + levelHeight,
      samples: rightSamples,
      fraudRatio: rightChildFraudRatio,
      parent: nodeToSplit
    };
    
    // Store child nodes in the parent
    nodeToSplit.left = leftNode;
    nodeToSplit.right = rightNode;
    
    // Draw connections first (so they are behind nodes)
    drawConnection(nodeToSplit, leftNode);
    drawConnection(nodeToSplit, rightNode);
    
    // Draw child nodes
    drawNode(leftNode);
    drawNode(rightNode);
    
    // Highlight the node that was just split
    highlightNode(nodeToSplit, feature, splitValue);
  }, [findLeafNodes, drawNode, drawConnection, highlightNode, maxDepth, width, levelHeight]);

  // Setup SVG sizing and responsive behavior
  useEffect(() => {
    const updateSvgViewBox = () => {
      const svg = svgRef.current;
      const container = containerRef.current;
      
      if (!svg || !container) return;
      
      // Set viewBox to maintain aspect ratio while filling the container
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate the scale to fit the SVG in the container
      const scaleX = containerWidth / width;
      const scaleY = containerHeight / height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of available space
      
      // Calculate the new viewBox dimensions
      const viewBoxWidth = containerWidth / scale;
      const viewBoxHeight = containerHeight / scale;
      
      // Center the tree in the viewBox
      const viewBoxX = (width - viewBoxWidth) / 2;
      const viewBoxY = (height - viewBoxHeight) / 2;
      
      // Set the viewBox
      svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    };
    
    // Set up ResizeObserver to handle container resizing
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        updateSvgViewBox();
      });
      
      resizeObserver.observe(container);
      
      // Initial setup
      updateSvgViewBox();
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [width, height]);

  // Check if the database is connected by making a small API call
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        // Check if we can get basic stats from the backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/transactions/stats/`);
        if (!response.ok) {
          setIsConnected(false);
          return;
        }
        
        const data = await response.json();
        // If we got data with no transactions, consider database as not properly set up
        if (data.total_transactions === 0) {
          setIsConnected(false);
        } else {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Database connection check failed:', error);
        setIsConnected(false);
      }
    };
    
    checkDatabaseConnection();
  }, []);

  // Function to start the entire analysis animation
  const startAnimation = useCallback(() => {
    // If database isn't connected, don't allow animation
    if (!isConnected) {
      return;
    }
    
    // Clear existing intervals before starting new ones
    if (animationRef.current) clearInterval(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (animationActive) return;
    
    // IMPORTANT: Removed the API call from here to prevent duplicate calls
    // The API call now happens only in the dashboard component
    
    setAnimationActive(true);
    setCurrentTree(1);
    setSteps(0);
    setProgress(0);
    setElapsedTime(0);
    setCurrentFeature(null);
    
    // Generate the first tree
    generateTree(); 
    let treeCount = 1;
    let treeSteps = 0;
    
    // Start the elapsed timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
    
    // Start the main animation loop
    animationRef.current = window.setInterval(() => {
      if (!treeDataRef.current) return;

      treeSteps++;
      setSteps(treeSteps);
      
      // Decide whether to grow the current tree or start a new one
      const stepsPerTree = 8;
      const canGrow = findLeafNodes(treeDataRef.current).some(n => n.depth < maxDepth - 1);

      if (treeSteps < stepsPerTree && canGrow) {
        // Continue growing the current tree
        advanceTree();
      } else {
        // Time to start a new tree
        treeCount++;
        if (treeCount > thresholds.tree_count) {
          // Animation complete
          if (animationRef.current) clearInterval(animationRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setProgress(100);
          setCurrentFeature("Classification complete");
          setAnimationActive(false);
          
          // Call the onComplete callback if provided
          if (onComplete) {
            onComplete();
          }
          return;
        }

        setCurrentTree(treeCount);
        treeSteps = 0;
        setSteps(0);
        
        // Generate the new tree structure
        generateTree();
      }
      
      // Update overall progress
      setProgress(Math.min(99, Math.floor(((treeCount -1) + (treeSteps / stepsPerTree)) / thresholds.tree_count * 100)));
    }, 600);
  }, [animationActive, generateTree, advanceTree, findLeafNodes, maxDepth, thresholds, onComplete, randomForestMutation, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-start if specified
  useEffect(() => {
    if (autoStart) {
      const timeoutId = setTimeout(() => {
         startAnimation();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [autoStart, startAnimation]);

  return (
    <TreeVisualization 
      thresholds={thresholds} 
      onComplete={onComplete} 
      autoStart={autoStart}
    >
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'relative', 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Reduced height matching IsolationForestTree
          height: '280px',
          overflow: 'hidden'
        }}
      >
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            display: 'block',
            width: '100%',
            height: '100%',
            maxHeight: '280px'
          }}
        >
          {/* SVG content is generated dynamically */}
        </svg>
        
        {!animationActive && progress === 0 && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px'
            }}
            onClick={startAnimation}
          >
            {!isConnected ? (
              <Typography variant="subtitle1" color="error" sx={{ textAlign: 'center', px: 3 }}>
                Database connection failed or no data available.<br/>
                Please ensure backend server is running and data is loaded.
              </Typography>
            ) : (
              <Typography variant="subtitle1" color="white">
                Click to visualize Random Forest
              </Typography>
            )}
          </Box>
        )}
        
        {animationActive && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '16px',
              padding: '4px 8px'
            }}
          >
            <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
            <Typography variant="caption" color="white">
              {progress}%
            </Typography>
          </Box>
        )}
      </Box>
    </TreeVisualization>
  );
});

export default RandomForestTree;