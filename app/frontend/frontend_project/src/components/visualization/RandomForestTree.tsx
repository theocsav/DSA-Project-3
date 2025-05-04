import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import TreeVisualization from './TreeVisualization';
import { TreeVisualizationProps, COLORS, TREE_CONSTANTS } from './types';

// Tree node structure for Random Forest (similar to Isolation Forest for compatibility)
interface RFTreeNode {
  depth: number;
  samples: number;
  fraudRatio: number;
  left: RFTreeNode | null;
  right: RFTreeNode | null;
  x?: number;
  y?: number;
  feature?: string;
  splitValue?: number;
  parent?: RFTreeNode;
}

// Component implementation
const RandomForestTree = forwardRef<HTMLDivElement, TreeVisualizationProps>((props, ref) => {
  const { thresholds, onComplete, autoStart = false } = props;
  
  // State
  const [animationActive, setAnimationActive] = useState<boolean>(false);
  const [currentTree, setCurrentTree] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true); // Database connectivity check
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const treeRef = useRef<RFTreeNode | null>(null);
  
  // Canvas dimensions
  const TREE_WIDTH = 600;
  const TREE_HEIGHT = 400;
  const MAX_DEPTH = thresholds.max_tree_depth || TREE_CONSTANTS.MAX_DEPTH;
  
  // Create a new tree with data
  const createTree = useCallback(() => {
    // Create root node with samples
    const rootNode: RFTreeNode = { 
      depth: 0, 
      samples: Math.floor(Math.random() * 15) + 20, // Random sample size (20-34)
      fraudRatio: Math.random() * 0.25, // Random initial fraud ratio (0% - 25%)
      left: null,
      right: null
    };
    
    // Store the root node
    treeRef.current = rootNode;
    
    return rootNode;
  }, []);
  
  // Split a node in the tree
  const splitNode = useCallback((node: RFTreeNode | null) => {
    if (!node) return null;
    
    // Skip if node is already split or at max depth
    if (node.left || node.right || node.depth >= MAX_DEPTH - 1) {
      return node;
    }
    
    // Choose random feature to split on
    const features = ['amt', 'distance_km', 'age', 'trans_hour', 'category', 'job'];
    const featureIndex = Math.floor(Math.random() * features.length);
    const feature = features[featureIndex];
    setCurrentFeature(feature);
    
    // Choose random split point
    const splitValue = Math.floor(Math.random() * 100);
    
    // Set node properties
    node.feature = feature;
    node.splitValue = splitValue;
    
    // Distribute samples between children
    const leftRatio = 0.3 + Math.random() * 0.4; // Random ratio between 0.3 and 0.7
    const leftSamples = Math.max(1, Math.floor(node.samples * leftRatio));
    const rightSamples = Math.max(1, node.samples - leftSamples);
    
    // Distribute fraud samples
    const totalFraudSamples = Math.floor(node.samples * node.fraudRatio);
    const leftFraudRatio = Math.max(0, Math.min(1, node.fraudRatio + (Math.random() - 0.5) * 0.2));
    const leftFraudSamples = Math.min(leftSamples, Math.max(0, Math.floor(leftSamples * leftFraudRatio)));
    const rightFraudSamples = Math.min(rightSamples, Math.max(0, totalFraudSamples - leftFraudSamples));
    
    // Calculate fraud ratios for children
    const leftChildFraudRatio = leftSamples > 0 ? leftFraudSamples / leftSamples : 0;
    const rightChildFraudRatio = rightSamples > 0 ? rightFraudSamples / rightSamples : 0;
    
    // Create child nodes
    node.left = {
      depth: node.depth + 1,
      samples: leftSamples,
      fraudRatio: leftChildFraudRatio,
      left: null,
      right: null,
      parent: node
    };
    
    node.right = {
      depth: node.depth + 1,
      samples: rightSamples,
      fraudRatio: rightChildFraudRatio,
      left: null,
      right: null,
      parent: node
    };
    
    return node;
  }, [MAX_DEPTH]);
  
  // Find a random leaf node to split
  const findRandomLeafNode = useCallback((node: RFTreeNode | null, leafNodes: RFTreeNode[] = []): RFTreeNode | null => {
    if (!node) return null;
    
    if (!node.left && !node.right) {
      // This is a leaf node - only add if it's not at max depth
      if (node.depth < MAX_DEPTH - 1) {
        leafNodes.push(node);
      }
    } else {
      // Recursively search in children
      if (node.left) findRandomLeafNode(node.left, leafNodes);
      if (node.right) findRandomLeafNode(node.right, leafNodes);
    }
    
    // Return a random leaf node if we found any
    if (leafNodes.length > 0) {
      return leafNodes[Math.floor(Math.random() * leafNodes.length)];
    }
    
    return null;
  }, [MAX_DEPTH]);
  
  // Assign positions for tree visualization
  const layoutTree = useCallback((node: RFTreeNode, depth = 0, xMin = 0, xMax = TREE_WIDTH) => {
    if (!node) return;
    
    // Calculate vertical spacing
    const yStep = TREE_HEIGHT / (MAX_DEPTH + 1);
    
    // Add padding to prevent going out of bounds
    const padding = 20;
    const safeXMin = Math.max(padding, xMin);
    const safeXMax = Math.min(TREE_WIDTH - padding, xMax);
    
    // Assign positions
    node.x = Math.max(padding, Math.min(TREE_WIDTH - padding, (safeXMin + safeXMax) / 2));
    node.y = Math.min(TREE_HEIGHT - padding, depth * yStep + yStep / 2);
    
    // Layout children
    if (node.left) {
      layoutTree(node.left, depth + 1, safeXMin, node.x);
    }
    
    if (node.right) {
      layoutTree(node.right, depth + 1, node.x, safeXMax);
    }
  }, [TREE_WIDTH, TREE_HEIGHT, MAX_DEPTH]);
  
  // Draw the tree
  const drawTree = useCallback((root: RFTreeNode, highlightNode: RFTreeNode | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas size in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // Clear the canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Fill with background color
    ctx.fillStyle = 'rgb(30, 30, 60)';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // Calculate scale to fit the tree in the canvas
    const scaleX = displayWidth / TREE_WIDTH;
    const scaleY = displayHeight / TREE_HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of available space
    
    // Apply scaling transformation
    ctx.save();
    ctx.translate(displayWidth / 2, displayHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-TREE_WIDTH / 2, -TREE_HEIGHT / 2);
    
    // Assign positions to nodes
    layoutTree(root);
    
    // Draw tree edges
    const drawEdges = (node: RFTreeNode) => {
      if (!node) return;
      
      if (node.left && node.x !== undefined && node.y !== undefined && 
          node.left.x !== undefined && node.left.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.left.x, node.left.y);
        
        // Highlight edge if this node is being split
        const isHighlightEdge = highlightNode === node;
        ctx.strokeStyle = isHighlightEdge ? COLORS.SPLIT_LINE : COLORS.CONNECTION;
        ctx.lineWidth = isHighlightEdge ? 3 : 2;
        
        ctx.stroke();
        drawEdges(node.left);
      }
      
      if (node.right && node.x !== undefined && node.y !== undefined && 
          node.right.x !== undefined && node.right.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.right.x, node.right.y);
        
        // Highlight edge if this node is being split
        const isHighlightEdge = highlightNode === node;
        ctx.strokeStyle = isHighlightEdge ? COLORS.SPLIT_LINE : COLORS.CONNECTION;
        ctx.lineWidth = isHighlightEdge ? 3 : 2;
        
        ctx.stroke();
        drawEdges(node.right);
      }
    };
    
    // Draw tree nodes
    const drawNodes = (node: RFTreeNode) => {
      if (!node || node.x === undefined || node.y === undefined) return;
      
      // Draw the node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, TREE_CONSTANTS.NODE_RADIUS, 0, 2 * Math.PI);
      
      // Determine node color based on fraud ratio
      if (node.samples === 1) {
        // Single sample - based on fraud ratio
        ctx.fillStyle = node.fraudRatio > 0 ? COLORS.FRAUD : COLORS.NORMAL;
      } else {
        // Multiple samples - mix colors based on ratio
        ctx.fillStyle = node.fraudRatio > 0.5 ? COLORS.FRAUD : 
                        node.fraudRatio > 0 ? COLORS.MIXED : COLORS.NORMAL;
      }
      
      ctx.fill();
      ctx.strokeStyle = COLORS.NODE_STROKE;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw sample count in node
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${TREE_CONSTANTS.TEXT_SIZE}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.samples.toString(), node.x, node.y);
      
      // Draw feature and split info for highlighted node
      if (node === highlightNode && node.feature && node.splitValue !== undefined) {
        const featureText = node.feature.substring(0, 3); // Abbreviate feature name
        const valueText = node.splitValue.toFixed(1);
        const label = `${featureText}:${valueText}`;
        
        // Position text above the node
        const textX = node.x;
        const textY = node.y - 22;
        
        // Draw with outline for better visibility
        ctx.font = `bold ${TREE_CONSTANTS.FEATURE_TEXT_SIZE}px sans-serif`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(label, textX, textY);
        ctx.fillStyle = COLORS.SPLIT_TEXT;
        ctx.fillText(label, textX, textY);
      }
      
      // Continue with children
      if (node.left) drawNodes(node.left);
      if (node.right) drawNodes(node.right);
    };
    
    // Execute drawing in correct order
    drawEdges(root);
    drawNodes(root);
    
    // Restore original context
    ctx.restore();
  }, [layoutTree]);
  
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
  
  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle high-DPI displays
    const setupCanvas = () => {
      // Get the device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      
      // Get the size of the canvas in CSS pixels
      const rect = canvas.getBoundingClientRect();
      
      // Set the canvas dimensions accounting for high DPI displays
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale all drawing operations by the device pixel ratio
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };
    
    setupCanvas();
    
    // Add a resize listener to keep the canvas properly sized
    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
      
      // Redraw the tree if it exists
      if (treeRef.current) {
        drawTree(treeRef.current);
      }
    });
    
    resizeObserver.observe(canvas);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [drawTree]);
  
  // Start animation
  const startAnimation = useCallback(() => {
    // If database isn't connected, don't allow animation
    if (!isConnected) {
      return;
    }
    
    // Clear existing intervals before starting new ones
    if (animationRef.current) clearInterval(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (animationActive) return;
    
    setAnimationActive(true);
    setCurrentTree(1);
    setSteps(0);
    setProgress(0);
    setElapsedTime(0);
    
    // Create initial tree
    const rootNode = createTree();
    let treeCount = 1;
    let treeSteps = 0;
    
    // Draw initial tree
    drawTree(rootNode);
    
    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
    
    // Process animation steps
    animationRef.current = window.setInterval(() => {
      try {
        treeSteps++;
        setSteps(treeSteps);
        
        // Get current tree
        const currentTreeRoot = treeRef.current;
        if (!currentTreeRoot) {
          console.log("Tree reference lost, creating new tree");
          treeRef.current = createTree();
          drawTree(treeRef.current);
          return;
        }
        
        // Tree growth logic
        if (treeSteps < 8) {  // Grow tree for 8 steps
          // Find a random leaf node to split
          const leafNode = findRandomLeafNode(currentTreeRoot);
          
          // If we found a valid leaf node, split it
          if (leafNode && leafNode.depth < MAX_DEPTH - 1) {
            splitNode(leafNode);
            drawTree(currentTreeRoot, leafNode);  // Draw with highlight on the split node
          } else {
            // No more nodes to split, move to next tree
            treeCount++;
            setCurrentTree(treeCount);
            treeSteps = 0;
            setSteps(0);
            
            // Create a new tree
            treeRef.current = createTree();
            drawTree(treeRef.current);
          }
        } else {
          // Start a new tree after 8 steps
          treeCount++;
          setCurrentTree(treeCount);
          treeSteps = 0;
          setSteps(0);
          
          // Create a new tree
          treeRef.current = createTree();
          drawTree(treeRef.current);
        }
        
        // Update progress - loop back to 0% when we hit threshold
        if (treeCount > thresholds.tree_count) {
          // Reset tree count to 1 but keep animation running
          treeCount = 1;
          setCurrentTree(1);
          setProgress(0);
          
          // Optionally notify completion but keep running
          if (onComplete) onComplete();
        } else {
          // Update the progress normally
          setProgress(Math.floor((treeCount / thresholds.tree_count) * 100));
        }
      } catch (error) {
        console.error("Error in animation loop:", error);
        // Don't stop the animation, try to recover
        treeRef.current = createTree();
        drawTree(treeRef.current);
      }
    }, 2000);  // Animation speed: 200ms per step
    
    return () => {
      // Cleanup function for the animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [animationActive, createTree, drawTree, splitNode, findRandomLeafNode, thresholds, onComplete, isConnected, MAX_DEPTH]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Make sure to clean up all intervals when unmounting
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  // Auto-start if specified - using useEffect to respond immediately to autoStart prop changes
  useEffect(() => {
    console.log("AutoStart changed to:", autoStart);
    if (autoStart && !animationActive) {
      // Add a short delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        startAnimation();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startAnimation, animationActive]);
  
  // Effect to handle the case when animation stops unexpectedly
  useEffect(() => {
    if (animationActive && progress > 0 && progress < 100) {
      // If animation is active but no intervals are running, restart
      const checkAnimationState = setTimeout(() => {
        if (!animationRef.current && !treeRef.current) {
          console.log("Animation stopped unexpectedly, restarting");
          // Reset state and restart animation
          setAnimationActive(false);
          setTimeout(() => {
            startAnimation();
          }, 100);
        }
      }, 2000); // Check after 2 seconds
      
      return () => clearTimeout(checkAnimationState);
    }
  }, [animationActive, progress, startAnimation]);

  return (
    <TreeVisualization 
      thresholds={thresholds} 
      onComplete={onComplete} 
      autoStart={autoStart}
    >
      <Box sx={{ 
        position: 'relative', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflow: 'hidden'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block'
          }}
        />
        
        {!animationActive && progress === 0 && !isConnected && (
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
          >
            <Typography variant="subtitle1" color="error" sx={{ textAlign: 'center', px: 3 }}>
              Database connection failed or no data available.<br/>
              Please ensure backend server is running and data is loaded.
            </Typography>
          </Box>
        )}
      </Box>
    </TreeVisualization>
  );
});

export default RandomForestTree;