// Following pseudo code for A* Search Algorithm from:
// https://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
/*
  while open_list is not empty
    current = open_list element with lowest f cost
    if current = goal
      return construct_path(goal) // path found
    remove current from open_list
    add current to closed_list
    for each neighbor in neighbors(current)
      if neighbor not in closed_list
        neighbor.f = neighbor.g + heuristic(neighbor, goal)
        if neighbor is not in open_list
          add neighbor to open_list
        else
          openneighbor = neighbor in open_list
          if neighbor.g < openneighbor.g
            openneighbor.g = neighbor.g
            openneighbor.parent = neighbor.parent
  return false // no path exists
  
function neighbors(node)
  neighbors = set of valid neighbors to node // check for obstacles here
  for each neighbor in neighbors
    if neighbor is diagonal
      neighbor.g = node.g + diagonal_cost // eg. 1.414 (pythagoras)
    else
      neighbor.g = node.g + normal_cost // eg. 1
    neighbor.parent = node
  return neighbors
  
function construct_path(node)
  path = set containing node
  while node.parent exists
    node = node.parent
    add node to path
  return path
   
    */
   
/**
Calculates a* algorithm on the supplied graph with a given startNode and endNode
*/   
function astarAlgo(graph, startNode, endNode){ // note: g(n) is the same as n.distanceFromSource

	let numOfNodes = graph.nodes.heap.length;
	let sNode = null;
	let gNode = null;
	let startIndx = -1;
 
	for (let i=1; i<numOfNodes; i++){
    
		graph.nodes.heap[i].priority = null;
		graph.nodes.heap[i].previousNode = null;
		graph.nodes.heap[i].fForAStar = null;
		
		if(graph.nodes.heap[i].name === startNode){
			graph.nodes.heap[i].distanceFromSource = 0;
			startIndx = i;
			sNode = graph.nodes.heap[i];
		}
		
		if(graph.nodes.heap[i].name === endNode){
			gNode = graph.nodes.heap[i];
   
		}
   
	}
	
	let temp = graph.nodes.heap[1];
	graph.nodes.heap[1] = sNode;
	sNode = graph.nodes.getMin();
	graph.nodes.heap[startIndx] = temp;
	
	let openList = new MinHeapVertex();
	openList.insert(sNode);
	
	let openListNames = new Set(); 
	openListNames.add(startNode);
 
	let closedList = new Set();
	graph.nodes.heap[startIndx].fForAStar = sNode.distanceFromSource + graph.heuristic(sNode, gNode);
	graph.nodes.heap[startIndx].priority = graph.nodes.heap[startIndx].fForAStar;
	graph.nodes.updateHeap(graph.nodes.heap.length -1);
 
	let current = null;
	let neighbours = [];
	let numOfNeighbours = 0;
 
	while (openList.heap.length!==1){
  
		openList.updateHeap(openList.heap.length -1);
  
		current = openList.getMin();
  
		if (current) {
       
			if (current.name === endNode){
     
				for (let h=1; h<numOfNodes; h++){
         
					if (graph.nodes.heap[h].name === endNode){
         
						gNode = graph.nodes.heap[h];
						break;
					}
        
				}
     
				return [getPath(gNode), graph];
     
			}
    
			openList.remove();
			closedList.add(current.name);
   
			neighbours = getNeighbours(graph, current, closedList);
			numOfNeighbours = neighbours.length;
   
			for (let i = 0; i < numOfNeighbours; i++){
 
				let singleNeighbour = neighbours[i];
    
				if(!(closedList.has(singleNeighbour.name))){
      
					singleNeighbour.fForAStar = singleNeighbour.distanceFromSource + graph.heuristic(singleNeighbour, gNode);
					singleNeighbour.priority = singleNeighbour.fForAStar;
					graph.nodes.updateHeap(graph.nodes.heap.length-1);
      
					let neighName = singleNeighbour.name;
					let neighIndx = -1;
      
					if(!(openListNames.has(neighName))){
        
						openListNames.add(neighName);
						openList.insert(singleNeighbour);
        
						for (let h=1; h<numOfNodes; h++){
         
							if (graph.nodes.heap[h].name === neighName){
          
								graph.nodes.heap[h] = singleNeighbour;
								break;
								
							}
        
						}
                
						openList.updateHeap(openList.heap.length-1);
        
					} else {
        
						let openNeighbour = null; 
       
						let maxP = openList.heap.length;
						
						for (let p=1; p<maxP; p++){
							
							if(openList.heap[p].name === neighName){
        
								openNeighbour = openList.heap[p];
								neighIndx = p;
								break;
							}
               
						}
       
						if (singleNeighbour.distanceFromSource < openList.heap[neighIndx].distanceFromSource) {
       
							openList.heap[neighIndx] = singleNeighbour;
   
						}
     
						for (let h=1; h<numOfNodes; h++){
         
							if (graph.nodes.heap[h].name === openList.heap[neighIndx].name){
          
								graph.nodes.heap[h] = openList.heap[neighIndx];
								break;
								
							}
        
						}
               
         
						graph.nodes.updateHeap(numOfNodes-1);
        
					}
					
				}
				
			}
			
		}
		
	}
	
	return [false, graph];
	
 }

function astarAlgoVisual(graph, startNode, endNode){ // note: g(n) is the same as n.distanceFromSource
 
	let numOfNodes = graph.nodes.heap.length;
	let sNode = null;
	let gNode = null;
	let startIndx = -1;
 
	let toReturn  = [];
 
 	for (let i=1; i<numOfNodes; i++){
    
		graph.nodes.heap[i].priority = null;
		graph.nodes.heap[i].previousNode = null;
		graph.nodes.heap[i].fForAStar = null;
		
		if(graph.nodes.heap[i].name === startNode){
			graph.nodes.heap[i].distanceFromSource = 0;
			startIndx = i;
			sNode = graph.nodes.heap[i];
		}
		
		if(graph.nodes.heap[i].name === endNode){
			gNode = graph.nodes.heap[i];
   
		}
   
	}

	let temp = graph.nodes.heap[1];
	graph.nodes.heap[1] = sNode;
	sNode = graph.nodes.getMin();
	graph.nodes.heap[startIndx] = temp;
	
	let openList = new MinHeapVertex();
	openList.insert(sNode);
	
	let openListNames = new Set(); 
	openListNames.add(startNode);
	
	let closedList = new Set();
	graph.nodes.heap[startIndx].fForAStar = sNode.distanceFromSource + graph.heuristic(sNode, gNode);
	graph.nodes.heap[startIndx].priority = graph.nodes.heap[startIndx].fForAStar;
	graph.nodes.updateHeap(graph.nodes.heap.length -1);
 
	let current = null;
	let neighbours = [];
	let numOfNeighbours = 0;
 
	while (openList.heap.length!==1){
  
		openList.updateHeap(openList.heap.length -1);
  
		current = openList.getMin();
  
		if (current) {
   
			toReturn.push(current.name);
    
			if (current.name === endNode){
     
				for (let h=1; h<numOfNodes; h++){
         
					if (graph.nodes.heap[h].name === endNode){
         
						gNode = graph.nodes.heap[h];
						break;
						
					}
        
				}
     
				return [getPath(gNode), graph, toReturn];
     
			}
    
			openList.remove();
			closedList.add(current.name);
   
			neighbours = getNeighbours(graph, current, closedList);
			numOfNeighbours = neighbours.length;
   
			for (let i = 0; i < numOfNeighbours; i++){
 
				let singleNeighbour = neighbours[i];
    
				toReturn.push(singleNeighbour.previousNode.name + singleNeighbour.name);
        
				toReturn.push(singleNeighbour.name);
    
				if(!(closedList.has(singleNeighbour.name))){
      
					singleNeighbour.fForAStar = singleNeighbour.distanceFromSource + graph.heuristic(singleNeighbour, gNode);
					singleNeighbour.priority = singleNeighbour.fForAStar;
					graph.nodes.updateHeap(graph.nodes.heap.length-1);
      
					let neighName = singleNeighbour.name;
					let neighIndx = -1;
      
					if(!(openListNames.has(neighName))){
        
						openListNames.add(neighName);
						openList.insert(singleNeighbour);
        
						for (let h=1; h<numOfNodes; h++){
         
							if (graph.nodes.heap[h].name === neighName){
          
								graph.nodes.heap[h] = singleNeighbour;
								break;
								
							}
        
						}
                
						toReturn.push('tipper:');
						toReturn.push([singleNeighbour.name, singleNeighbour.distanceFromSource]); 
						openList.updateHeap(openList.heap.length-1);
        
					} else {
        
						let openNeighbour = null; 
       
						let maxP = openList.heap.length;
        
						for (let p=1; p<maxP; p++){
							
							if(openList.heap[p].name === neighName){
        
								openNeighbour = openList.heap[p];
								neighIndx = p;
								break;
							
							}
               
						}
              
						toReturn.push('unhighlight:');
						toReturn.push(openList.heap[neighIndx].previousNode.name+ openList.heap[neighIndx].name);
       
						if (singleNeighbour.distanceFromSource < openList.heap[neighIndx].distanceFromSource) {
							
							toReturn.push('unhighlight:');
							toReturn.push(openList.heap[neighIndx].previousNode.name+ openList.heap[neighIndx].name);
       
							openList.heap[neighIndx] = singleNeighbour;
   
							toReturn.push(singleNeighbour.previousNode.name + singleNeighbour.name);
							toReturn.push('tipper:');
							toReturn.push([singleNeighbour.name, singleNeighbour.distanceFromSource]); 
					
						}
     
						for (let h=1; h<numOfNodes; h++){
         
							if (graph.nodes.heap[h].name === openList.heap[neighIndx].name){
          
								graph.nodes.heap[h] = openList.heap[neighIndx];
								break;
								
							}
        
						}
                  
						graph.nodes.updateHeap(numOfNodes-1);
        
					}
					
				}
				
			}
 
		}
 
	}
	
	return [false, graph, toReturn];
	
}
   
function getPath (theNode){
 
     let path = [];
   
     while (theNode && theNode.name) {
      path.unshift(theNode.name);
      theNode = theNode.previousNode;
     }
     
     return path;
     
}


function getNeighbours(graph, current, closedList){
 let neighbourNames = current.neighbours;
 let neighbours = [];
 let maxi = graph.nodes.heap.length;
 let from = current.name;
  
 for (let i = 1; i < maxi; i++){
  
  let to = graph.nodes.heap[i].name;
  if (!closedList.has(to)){
  
   let index = neighbourNames.indexOf(to); // check if current node is a neighbour
  
   if (index !== -1) { 
    neighbours.push(JSON.parse(JSON.stringify(graph.nodes.heap[i])));
 
    let maxIndex = neighbours.length -1;
   
    neighbours[maxIndex].distanceFromSource = current.distanceFromSource + graph.edges[from+to].weight;
    neighbours[maxIndex].previousNode = current;
   }
  
  }
  
 }
 
 graph.nodes.updateHeap(maxi-1);
 
 return neighbours;
}


