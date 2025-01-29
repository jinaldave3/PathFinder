
//  BFS

export function bfs(grid, startNode, endNode) {
  const queue = [];
  const visitedNodesInOrder = [];

  startNode.isVisited = true;
  queue.push(startNode);

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode || currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    if (currentNode === endNode) {
      const path = reconstructPath(endNode);
      return { visitedNodesInOrder, path };
    }

    const neighbors = getNeighbors(grid, currentNode);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        queue.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, path: [] };
}

/////////////////////////////
//  DFS
/////////////////////////////
export function dfs(grid, startNode, endNode) {
  const stack = [];
  const visitedNodesInOrder = [];

  startNode.isVisited = true;
  stack.push(startNode);

  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (!currentNode || currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    if (currentNode === endNode) {
      const path = reconstructPath(endNode);
      return { visitedNodesInOrder, path };
    }

    const neighbors = getNeighbors(grid, currentNode);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, path: [] };
}

/////////////////////////////
//  Dijkstra
/////////////////////////////
export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;

  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length) {
    // Sort by distance
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();
    if (!closestNode || closestNode.isWall) continue;

    if (closestNode.distance === Infinity) {
      // No path found
      return { visitedNodesInOrder, path: [] };
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === endNode) {
      const path = reconstructPath(endNode);
      return { visitedNodesInOrder, path };
    }

    updateUnvisitedNeighbors(closestNode, grid);
  }

  return { visitedNodesInOrder, path: [] };
}

function updateUnvisitedNeighbors(node, grid) {
  const neighbors = getNeighbors(grid, node);
  for (const neighbor of neighbors) {
    if (neighbor.isVisited || neighbor.isWall) continue;
    const altDist = node.distance + 1;
    if (altDist < neighbor.distance) {
      neighbor.distance = altDist;
      neighbor.previousNode = node;
    }
  }
}

/////////////////////////////
//  A*
/////////////////////////////
export function aStar(grid, startNode, endNode) {
  const openSet = [];
  const visitedNodesInOrder = [];

  startNode.gCost = 0;
  startNode.hCost = heuristic(startNode, endNode);
  startNode.fCost = startNode.gCost + startNode.hCost;
  openSet.push(startNode);

  while (openSet.length) {
    openSet.sort((a, b) => a.fCost - b.fCost);
    const current = openSet.shift();
    if (!current || current.isWall) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) {
      const path = reconstructPath(endNode);
      return { visitedNodesInOrder, path };
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;
      const tentativeG = current.gCost + 1;
      if (tentativeG < neighbor.gCost) {
        neighbor.gCost = tentativeG;
        neighbor.hCost = heuristic(neighbor, endNode);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.previousNode = current;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return { visitedNodesInOrder: visitedNodesInOrder, path: [] };
}

/////////////////////////////
//  Helper Functions
/////////////////////////////
function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getNeighbors(grid, node) {
  const { row, col } = node;
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  const neighbors = [];
  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
      neighbors.push(grid[nr][nc]);
    }
  }
  return neighbors;
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
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
