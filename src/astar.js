
export function aStar(grid, startNode, endNode) {
  // Initialize openSet with the start node
  const openSet = [];
  startNode.gCost = 0;
  startNode.hCost = heuristic(startNode, endNode);
  startNode.fCost = startNode.hCost;
  openSet.push(startNode);

  const visitedNodesInOrder = []; // For visualization

  while (openSet.length > 0) {
    // Sort openSet by fCost to simulate priority queue
    openSet.sort((a, b) => a.fCost - b.fCost);
    const currentNode = openSet.shift();

    // If we hit a wall or something unexpected, skip
    if (!currentNode || currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // If currentNode is the endNode, construct the path
    if (currentNode === endNode) {
      return { visitedNodesInOrder, path: reconstructPath(endNode) };
    }

    // Check neighbors
    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      const tentativeG = currentNode.gCost + 1; // cost of 1 to move to neighbor
      if (tentativeG < neighbor.gCost) {
        neighbor.previousNode = currentNode;
        neighbor.gCost = tentativeG;
        neighbor.hCost = heuristic(neighbor, endNode);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  // If no path found
  return { visitedNodesInOrder, path: [] };
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length
    ) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  return neighbors;
}

// Simple manhattan distance for heuristic
function heuristic(a, b) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  return dx + dy;
}

function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}
