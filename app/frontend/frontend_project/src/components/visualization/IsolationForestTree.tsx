import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import TreeVisualization from './TreeVisualization';
import { TreeVisualizationProps, COLORS, TREE_CONSTANTS } from './types';
import { useIsolationForestAnalysis } from '../../api/queries';

// Tree node structure for Isolation Forest
interface IFTreeNode {
  depth: number;
  data: any[];
  left: IFTreeNode | null;
  right: IFTreeNode | null;
  x?: number;
  y?: number;
  feature?: string;
  splitValue?: number;
  parent?: IFTreeNode;
}

// Component implementation
const IsolationForestTree = forwardRef<HTMLDivElement, TreeVisualizationProps>((props, ref) => {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // API mutation hook
  const isolationForestMutation = useIsolationForestAnalysis();
  
  // FIXED SEED FOR DETERMINISTIC TREE GENERATION
  const FIXED_SEED = 12345;
  
  // Canvas dimensions
  const TREE_WIDTH = 600;
  const TREE_HEIGHT = 400;
  const MAX_DEPTH = thresholds.max_tree_depth || TREE_CONSTANTS.MAX_DEPTH;
  
  // Pseudo-random number generator with seed
  const createRandomGenerator = (seed: number) => {
    let _seed = seed;
    return () => {
      _seed = (_seed * 9301 + 49297) % 233280;
      return _seed / 233280;
    };
  };
  
  // Create a new tree with data
  const createTree = useCallback(() => {
    const rand = createRandomGenerator(FIXED_SEED);
    
    // Create root node with simulated data
    const root: IFTreeNode = {
      depth: 0,
      data: new Array(thresholds.sample_size > 25 ? 25 : thresholds.sample_size).fill(0),
      left: null,
      right: null
    };
    
    // Create initial queue of nodes to process
    const queue = [root];
    
    return {
      root,
      queue,
      currentPath: []
    };
  }, [thresholds.sample_size]);
  
  // Split a node in the tree
  const splitNode = useCallback((treeData: any) => {
    const { queue } = treeData;
    
    if (!queue.length) return null;
    
    // Get next node to process
    const node = queue.shift();
    
    // Skip if node has 1 or fewer items
    if (!node.data || node.data.length <= 1) {
      return treeData;
    }
    
    // Use fixed random generator for deterministic tree
    const rand = createRandomGenerator(FIXED_SEED + (node.depth * 100) + (queue.length * 10));
    
    // Choose random feature to split on
    const features = ['amt', 'distance_km', 'age', 'trans_hour', 'category', 'job'];
    const featureIndex = Math.floor(rand() * features.length);
    const feature = features[featureIndex];
    setCurrentFeature(feature);
    
    // Find range of values for this feature
    const min = 0;
    const max = 100;
    
    // Choose random split point
    const splitValue = min + rand() * (max - min);
    
    // Determine split ratio (slightly random)
    const leftRatio = 0.3 + rand() * 0.4;
    const leftCount = Math.max(1, Math.floor(node.data.length * leftRatio));
    const rightCount = Math.max(1, node.data.length - leftCount);
    
    // Set node properties
    node.feature = feature;
    node.splitValue = splitValue;
    
    // Create child nodes
    node.left = {
      depth: node.depth + 1,
      data: new Array(leftCount).fill(0),
      left: null,
      right: null,
      parent: node
    };
    
    node.right = {
      depth: node.depth + 1,
      data: new Array(rightCount).fill(0),
      left: null,
      right: null,
      parent: node
    };
    
    // Add children to queue if they're not too deep
    if (node.depth + 1 < MAX_DEPTH) {
      queue.push(node.left, node.right);
    }
    
    // Build path to current node
    const currentPath: any[] = [];
    let current = node;
    while (current) {
      currentPath.unshift(current);
      current = current.parent;
    }
    
    treeData.currentPath = currentPath;
    return treeData;
  }, [MAX_DEPTH]);
  
  // Assign positions for tree visualization
  const layoutTree = useCallback((node: IFTreeNode, depth = 0, xMin = 0, xMax = TREE_WIDTH) => {
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
  const drawTree = useCallback((root: IFTreeNode, highlightPath: IFTreeNode[] = []) => {
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
    const drawEdges = (node: IFTreeNode) => {
      if (!node) return;
      
      if (node.left && node.x !== undefined && node.y !== undefined && 
          node.left.x !== undefined && node.left.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.left.x, node.left.y);
        
        // Check if this edge is on the highlight path
        const isHighlightEdge = highlightPath.includes(node) && highlightPath.includes(node.left);
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
        
        // Check if this edge is on the highlight path
        const isHighlightEdge = highlightPath.includes(node) && highlightPath.includes(node.right);
        ctx.strokeStyle = isHighlightEdge ? COLORS.SPLIT_LINE : COLORS.CONNECTION;
        ctx.lineWidth = isHighlightEdge ? 3 : 2;
        
        ctx.stroke();
        drawEdges(node.right);
      }
    };
    
    // Draw tree nodes
    const drawNodes = (node: IFTreeNode) => {
      if (!node || node.x === undefined || node.y === undefined) return;
      
      // Draw the node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, TREE_CONSTANTS.NODE_RADIUS, 0, 2 * Math.PI);
      
      // Assign color using deterministic approach
      const nodeDepth = node.depth;
      const nodeSize = node.data.length;
      const rand = createRandomGenerator(FIXED_SEED + nodeDepth * 100 + nodeSize);
      
      if (nodeSize === 1) {
        // Single item - deterministic fraud assignment
        ctx.fillStyle = rand() < 0.15 ? COLORS.FRAUD : COLORS.NORMAL;
      } else {
        // Multiple items - deterministic fraud presence
        const containsFraud = rand() < 0.25;
        ctx.fillStyle = containsFraud ? COLORS.MIXED : COLORS.NORMAL;
      }
      
      ctx.fill();
      ctx.strokeStyle = COLORS.NODE_STROKE;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw item count in node
      if (node.data) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${TREE_CONSTANTS.TEXT_SIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.data.length.toString(), node.x, node.y);
        
        // Draw feature and split value for non-leaf nodes that were just split
        if (node.feature && node.splitValue !== undefined && (node.left || node.right)) {
          const featureText = node.feature.substring(0, 3); // Abbreviate feature name
          const valueText = node.splitValue.toFixed(1);
          
          // Check if this node is a highlight node (was just split)
          const isHighlightNode = highlightPath.length > 0 && node === highlightPath[highlightPath.length - 1];
          
          if (isHighlightNode) {
            // Draw text with black outline for better visibility
            const label = `${featureText}:${valueText}`;
            const textX = node.x;
            const textY = node.y - 22;
            
            ctx.font = `bold ${TREE_CONSTANTS.FEATURE_TEXT_SIZE}px sans-serif`;
            
            // Draw text outline
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(label, textX, textY);
            
            // Draw text fill
            ctx.fillStyle = COLORS.SPLIT_TEXT;
            ctx.fillText(label, textX, textY);
          }
        }
      }
      
      // Continue with children
      if (node.left) drawNodes(node.left);
      if (node.right) drawNodes(node.right);
    };
    
    // Draw highlight path
    const drawPath = () => {
      if (highlightPath.length <= 1) return;
      
      for (let i = 0; i < highlightPath.length - 1; i++) {
        const node = highlightPath[i];
        const nextNode = highlightPath[i + 1];
        
        if (node.x === undefined || node.y === undefined || 
            nextNode.x === undefined || nextNode.y === undefined) continue;
        
        // Apply glow effect
        ctx.shadowColor = COLORS.SPLIT_LINE;
        ctx.shadowBlur = 6;
        
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(nextNode.x, nextNode.y);
        ctx.strokeStyle = COLORS.SPLIT_LINE;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reset shadow for other elements
        ctx.shadowBlur = 0;
      }
    };
    
    // Execute drawing in correct order
    drawEdges(root);
    drawNodes(root);
    drawPath();
    
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
    });
    
    resizeObserver.observe(canvas);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Start animation
  const startAnimation = useCallback(() => {
    // If database isn't connected, don't allow animation
    if (!isConnected) {
      return;
    }
    
    if (animationActive) return;
    
    // Start API call
    isolationForestMutation.mutate({
      trees: thresholds.tree_count,
      sample_size: thresholds.sample_size,
      threshold: thresholds.threshold
    });
    
    setAnimationActive(true);
    setCurrentTree(1);
    setSteps(0);
    setProgress(0);
    setElapsedTime(0);
    
    // Create initial data
    let treeData = createTree();
    let treeCount = 1;
    let treeSteps = 0;
    
    // Draw initial tree
    drawTree(treeData.root, []);
    
    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
    
    // Process animation steps
    animationRef.current = window.setInterval(() => {
      treeSteps++;
      setSteps(treeSteps);
      
      if (treeSteps < 10) {
        // Continue with current tree
        const result = splitNode(treeData);
        if (result) {
          treeData = result;
          drawTree(treeData.root, treeData.currentPath || []);
        }
      } else {
        // Start a new tree
        treeCount++;
        setCurrentTree(treeCount);
        treeSteps = 0;
        setSteps(0);
        
        // Create new tree with new sample - using same seed for deterministic tree
        treeData = createTree();
        drawTree(treeData.root, []);
      }
      
      // Update progress
      setProgress(Math.min(99, Math.floor((treeCount / thresholds.tree_count) * 100)));
      
      // Check if we're done
      if (treeCount >= thresholds.tree_count) {
        if (animationRef.current) clearInterval(animationRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setProgress(100);
        setAnimationActive(false);
        
        // Final message
        setCurrentFeature("Analysis complete");
        
        // Call the onComplete callback if provided
        if (onComplete) onComplete();
      }
    }, 400);
  }, [animationActive, createTree, drawTree, splitNode, thresholds, onComplete, isolationForestMutation, isConnected]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Handle animation trigger from parent via ref
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart, startAnimation]);

  return (
    <TreeVisualization 
      thresholds={thresholds} 
      onComplete={onComplete} 
      autoStart={autoStart}
    >
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block'
          }}
        />
        
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
                Click to visualize Isolation Forest
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

export default IsolationForestTree;