/**
	Used as the heap where nodes with the lowest 'priority' are first 
	(0 being the least and null being used as 'infinity')
	First node is placed in index 1.
	For a parent with index i:
		- The left child of each node is at index (i * 2).
		- The right child is at index (i * 2 + 1)
*/
class MinHeapVertex {
   
 /**
	Initialises the array for the heap. A 'dummy element' (null) is placed at index 0
 */
 constructor () {
	this.heap = [null]
 }
   
 /**
	Returns the min element in the heap (at index 1 in the array)
 */
 getMin () {
	return this.heap[1];
 }
   
 /**
	Inserts a vertex into the heap. Updates heap accordingly.
 */
 insert(vertex) {
	
	this.heap.push(vertex); // vertex is added to the end of the heap
	if (vertex.priority !== null){ //if the vertex has a numerical priority 
		let maxL = this.heap.length -1;
		this.updateHeap(maxL);
	}
      
 }
 
 /**
	Removes and returns the minimum vertex in the heap. Updates heap accordingly.
 */
 remove() {
   
	// if either the heap is 'empty' (null value at 0) or has one vertex in it (plus the null value)
	if (this.heap.length < 3) {
	  
		const toReturn = this.heap.pop();
		this.heap[0] = null;
		return toReturn;
   
	} else {
	  
		const toRemove = this.heap[1];
		this.heap[1] = this.heap.pop();
		let maxL = this.heap.length -1;
		this.updateHeap(maxL);
		return toRemove;
	
	}
  
 }
 
 /**
	Updates the heap starting at the index given and bubbling up
 */
 updateHeap(currentIdx){  
 
	if(currentIdx>1){
	  
		let parentIndx = 1;      
		let siblingIndx = 1;
	 
		if(currentIdx % 2 == 0){ // if it is the left child of its parent
			parentIndx = currentIdx/2;
			siblingIndx = parentIndx * 2 +1;
		} else {
			parentIndx = (currentIdx-1)/2;
			siblingIndx = parentIndx * 2;
		}
	 
		// assign parent and both children nodes
	 
		let aParentNode = this.heap[parentIndx];
		let siblingNode = this.heap[siblingIndx];
		let currentNode = this.heap[currentIdx];
	 
		if ((currentNode.priority!==null) &&
			((currentNode.priority < aParentNode.priority) || (aParentNode.priority===null))){
       
			this.heap[parentIndx] = currentNode;
			this.heap[currentIdx] = aParentNode;
		
		}
     
		aParentNode = this.heap[parentIndx];
	 
		if (siblingNode && siblingNode.priority!==null &&
			((siblingNode.priority < aParentNode.priority)|| (aParentNode.priority===null))) {
			this.heap[parentIndx] = siblingNode;
			this.heap[siblingIndx] = aParentNode;
		}
	 
		this.updateHeap(parentIndx);
     
	}
 
  }
 
}

/**
	Used to represent the nodes
*/
class Vertex {
	
	/**
		When creating a vertex (node) you must supply a node name, an x-coordinate and a y-coordinate.
		The vertex will be assigned these values as well as initialising values for distanceFromSource, 
		priority, neighbours, previousNode, visited, fForAStar, hForAStar, regionID, and isExportedNode
	*/
	constructor(name, x, y) {
 
		this.name = name; 
		
		this.distanceFromSource = null; 
		// used as g(n) for A* (as they are equivalent), used for all algorithms here as well
  
		this.priority = null; 
		// priority should be the same as distanceFromSource for Dijkstra's algorithm (original and partitioned)
		// for A* priority should be the same as fForAStar
		
		this.neighbours = []; // If there is an edge FROM this node TO node V then V is a neighbour
		this.previousNode = null;
		this.visited = false; 
		
		this.fForAStar = null; // used as f(n) for A*
		this.hForAStar = null; // used as h(n) for A*
		
		this.x = x; 
		this.y = y;
		
		this.regionID = null; // used for the modified Dijkstra's algorithm 
		
		this.isExportedNode = false;
		// nodes are either interior nodes or exported nodes
		// exported nodes are those which are are incident to at least one interface edge 
		// all the others are interior nodes
	}
 
}

/**
Used to represent the edges
*/
class Edge {
	
	/**
		When creating an Edge you must supply a weight, a source node's name, and a target node's name
		The Edge will be assigned these values as well as initialising values for actualTo, fromFlags, and isInterfaceEdge.
	*/
	constructor(weight, from, to){
	  
		this.weight = weight;
		this.from = from;
		this.to = to;	
	
		this.actualTo = null;
	
		this.fromFlags = [];
		// will be set as true for each region i if there is a shortest path from node 'from' 
		// over this edge into region i
		// e.g. [false, true, false, true...] with a total number of flags equal to number of regions
		// no toFlags as this is a directed graph not undirected
	
		this.isInterfaceEdge = false;
		// edges are either interface edges or internal edges
		// internal edges are those that connect 2 nodes in the same region
		// interface edges are those that connect 2 nodes in separate regions (typically 'geometrically adjacent')
	}
	
}

/**
	Used to represent the graph. This Graph will not allow negative weights when adding edges.
*/
function Graph(){
	
    this.nodes = new MinHeapVertex();
    this.edges = {};
	this.maxRegionNumber = null; // the number of regions
	this.regionByNodes = null; // will be possible to get the region of the node via a node name
	
}

/**
	Add a node to the graph. Requires the node name, x-coordinate, and y-coordinate
*/
Graph.prototype.addNode = function(vertexName, x, y) {
    this.nodes.insert(new Vertex(vertexName, x, y));
};

/**
	Adds an edge to the graph from source node (vertex1) to target node (vertex2) with the supplied weight.
	Updates the node neighbours for source node. 
	Requires the edge's source node's name, the edge's target node's name, and the edge weight.
	Edge weights are not allowed to be negative in this Graph. Source and target nodes must exist in this Graph.
*/
Graph.prototype.addEdge = function(vertex1, vertex2, weight) {
 
	if (weight>=0){
	 
		let foundTo = false; // whether vertex2 has been found in the graph yet
		let valid = false; // whether the parameters supplied make a valid edge in this graph

		let maxN = this.nodes.heap.length;
		let i = 1;  
		let j = 1; 
		
		let actualTo = null;
  
		while ((foundTo == false)&&(j<maxN)){ // while still searching for vertex2 in the graph
  
			if(this.nodes.heap[j].name===vertex2){
		  
				actualTo = this.nodes.heap[j];
				foundTo = true;
		  
			}
	  
			j++;
	  
		}
  
		if (foundTo){
			
			while ((valid == false)&&(i<maxN)){
				
				if (this.nodes.heap[i].name===vertex1){
					
					edge = new Edge (weight, vertex1, vertex2);
					edge.actualTo = actualTo;
					this.nodes.heap[i].neighbours.push(vertex2);
					name = vertex1+vertex2;
					this.edges[name] = edge;
					valid = true;
					
				}
		  
				i++;
				
			}
			
		}
  
		if (!valid){ // vertex1, vertex2, or both have not been found
			alert ('Invalid edge parameters. Please check source ' + vertex1 +' and target ' +vertex2+' actually exist');
		}
  
	} else{
		alert('Invalid edge parameters. Graph does not allow negative weights.');
	}
 
};

/**
	Initialise the graph for both the original Dijkstra algorithm and the modified version
*/
Graph.prototype.initialiseGraph = function(startNode){
	
	let numOfNodes = this.nodes.heap.length;
    let indexStart = -1; //used to check where the start node was
 
    for (let i=1; i<numOfNodes; i++){
		
    	this.nodes.heap[i].previousNode = null;
		this.nodes.heap[i].visited = false;
     
    	if(this.nodes.heap[i].name === startNode){
			
			this.nodes.heap[i].distanceFromSource = 0;
			this.nodes.heap[i].priority = 0;
			indexStart = i;
			
		} else {
			
     		this.nodes.heap[i].distanceFromSource = null;
			this.nodes.heap[i].priority = null;
			
  		}
   
	}
  
	this.nodes.updateHeap(indexStart);

}

/**
	Dijkstra's original algorithm.
	Follows the pseudocode from http://www.gitta.info/Accessibiliti/en/html/Dijkstra_learningObject1.html 
	
	1: function Dijkstra(Graph, source):
	2: 		for each vertex v in Graph: // Initialization
	3: 			dist[v] := infinity // initial distance from source to vertex v is set to infinite
	4: 			previous[v] := undefined // Previous node in optimal path from source
	5: 		dist[source] := 0 // Distance from source to source
	6: 		Q := the set of all nodes in Graph // all nodes in the graph are unoptimized - thus are in Q
	7: 		while Q is not empty: // main loop
	8: 			u := node in Q with smallest dist[ ]
	9: 			remove u from Q
	10: 		for each neighbor v of u: // where v has not yet been removed from Q.
	11: 			alt := dist[u] + dist_between(u, v)
	12: 			if alt < dist[v] // Relax (u,v)
	13: 				dist[v] := alt
	14: 				previous[v] := u
	15: 	return previous[ ]

*/
Graph.prototype.dijkAlgo = function(startNode, goal){
 
	let maxOfGraph= this.nodes.heap.length;
   
	this.initialiseGraph(startNode);
	
    let nodesToCheck = new MinHeapVertex();
	nodesToCheck.heap = JSON.parse(JSON.stringify(this.nodes.heap));
 
    let tocontinue = true;
    let v = null;      
   
	while (tocontinue){
		
		u = nodesToCheck.getMin();
		
		if (u && u.name!==goal &&
			(u.distanceFromSource!==null || (u.previousNode && u.previousNode.distanceFromSource!==null) )){  
           
			neighbours = u.neighbours;
			let maxN = neighbours.length;
			let j = 0;
   
			while ( (j<maxN) && (u!=goal) ){    
             
				v = neighbours[j];
				let alt = u.distanceFromSource+this.edges[u.name+v].weight;
            
				let index = -1;
				
				for (let h=1; h<maxOfGraph; h++){
        
					if(this.nodes.heap[h].name===v){
						index = h;
						break;
					}
					
				}

				let maxOfCopy = nodesToCheck.heap.length;
				let k = 1;
				let index2 = -1;
				let found = false;
				
				while ((found == false)&&(k<maxOfCopy)){
					
					if(nodesToCheck.heap[k].name===v){
						index2 = k;
						found = true;
					}
     
					k++;
     
				}
				
				if ((index!==-1) && (!(this.nodes.heap[index].visited)) && (index2!==-1)){
     
					current = this.nodes.heap[index].distanceFromSource;
     
					if ((current===null) || (alt<current)){
						
						this.nodes.heap[index].distanceFromSource = alt;
						this.nodes.heap[index].priority = alt;
						this.nodes.heap[index].previousNode = u;
						this.nodes.updateHeap(index);
						
						nodesToCheck.heap[index2].distanceFromSource = alt;  
						nodesToCheck.heap[index2].priority = alt;  
						nodesToCheck.heap[index2].previousNode = u;
						nodesToCheck.updateHeap(index2);
   
					}
     
				}
     
				j++;
               
			}
			
        }
       
        let foundu = false;
        let t = 1;
        let indexOfU = -1;
        while ((foundu == false)&&(t<maxOfGraph)){
   
           if(this.nodes.heap[t].name===u.name){
				indexOfU = t;
				foundu = true;
			}
     
			t++;
     
		}
       
		this.nodes.heap[indexOfU].visited = true;
        nodesToCheck.remove();
		
        if ( (u && u.name === goal) || (nodesToCheck.heap.length===1) ){
 
          tocontinue = false;
   
        }
 
    }
       
	if (goal){
		
		path = [];
   
		if (u){
			
			path.unshift(u.name);
			previous = u.previousNode;
 
			while (previous){
 
				path.unshift(previous.name);
				previous = previous.previousNode;
   
			}
     
		}
 
		if (path[0]!==startNode){
			path = undefined;
		}
		
		return path;
		
	} else{
		return this;
	}
	
}

/**
	Same algorithm as Graph.prototype.dijkAlgo but returns information for visualisation
*/
Graph.prototype.dijkAlgoWithVisual = function(startNode, goal){
 
	let toReturn = [];
	let maxOfGraph = this.nodes.heap.length;

	this.initialiseGraph(startNode);
	
    let nodesToCheck = new MinHeapVertex();
    nodesToCheck.heap = JSON.parse(JSON.stringify(this.nodes.heap));
 
    let tocontinue = true;
    let v = null;      
   
    while (tocontinue){
        
        u = nodesToCheck.getMin();
        toReturn.push(u.name);
        toReturn.push('tipper:'); 
        toReturn.push([u.name, u.distanceFromSource]);  		    
  
        if (u && u.name!==goal && (u.distanceFromSource!==null || (u.previousNode && u.previousNode.distanceFromSource!==null) )){  
           
        		neighbours = u.neighbours;
        		
        		let maxN = neighbours.length;
        		let j = 0;
				
				while ( (j<maxN) && (u.name!=goal) ){
       			
					v = neighbours[j];
					toReturn.push(u.name+v); // will highlight the edge
					toReturn.push(v); // will highlight the node
					
					let alt = u.distanceFromSource+this.edges[u.name+v].weight;
					let maxOfCopy = nodesToCheck.heap.length;
					let k = 1;
					let k2 = 1;
					let indexInGraph = -1;
					let indexInCopy = -1;
					let found = false;
					let found2 = false;
					
					while ((found == false)&&(k<maxOfGraph)){
       				
						if(this.nodes.heap[k].name===v){
							indexInGraph = k;
							found = true;
						}
       				
						k++;
					}
       		
					while ((found2 == false)&&(k2<maxOfCopy)){

						if(nodesToCheck.heap[k2].name===v){
							indexInCopy = k2;
							found2 = true;
						}
     
     					k2++;
     					
     				}
     				
					if (indexInCopy===-1){
						toReturn.push('unhighlight:'); 
						toReturn.push(u.name+ v);
					} else {
					   toReturn.push('tipper:'); 
     					toReturn.push([v, nodesToCheck.heap[indexInCopy].distanceFromSource]);  
					} 				 
    				 
    				if ((indexInGraph!==-1) 
    				&& (!(this.nodes.heap[indexInGraph].visited)) 
    				&& (indexInCopy!==-1)){
     
        				current = this.nodes.heap[indexInGraph].distanceFromSource;
         			
        				if ((current===null) || (alt<current)){
							
							if (this.nodes.heap[indexInGraph].previousNode!==null){
								toReturn.push('unhighlight:'); 
								toReturn.push(this.nodes.heap[indexInGraph].previousNode.name+ v);
							} 
     	  	
							toReturn.push('tipper:'); 
							toReturn.push([this.nodes.heap[indexInGraph].name, alt]);  
							this.nodes.heap[indexInGraph].distanceFromSource = alt;
							this.nodes.heap[indexInGraph].priority = alt;
							this.nodes.heap[indexInGraph].previousNode=u;
							this.nodes.updateHeap(indexInGraph);

							nodesToCheck.heap[indexInCopy].distanceFromSource = alt;
							nodesToCheck.heap[indexInCopy].priority = alt;  
							nodesToCheck.heap[indexInCopy].previousNode=u;
							nodesToCheck.updateHeap(indexInCopy);
   
        				} else if ((current!==null) && (alt>current) && (this.nodes.heap[indexInGraph].previousNode!==null)){
							toReturn.push('unhighlight:'); 
							toReturn.push(u.name+ v);
        				} 
     
       }
     
					j++;
               
				}
        }

       nodesToCheck.remove();
     
       if ( (u && u.name === goal) || (nodesToCheck.heap.length===1) ){
 
          tocontinue = false;
   
        }
 
    }
       
	if (goal){
		path = [];
   
		if (u){
			path.unshift(u.name);
			previous = u.previousNode;
 
			while (previous){
 
				path.unshift(previous.name);
				previous = previous.previousNode;
	
			}
     
		}
 
		if (path[0]!==startNode){
			path = "There is no path between the start and end nodes selected";
		}
	
		return [path, toReturn];
		
	} else{
		
		return ["No end goal selected so please look at graph for values", toReturn, this];
 
	}
	
}

/**
	Sets the regions in the graph
*/
Graph.prototype.setRegions = function(){

	let reg = this.calculateRegions(); //[regionData, allMinsX];
	let regionData = reg[0];
	let allMinsX = reg[1];
	
	this.regionByNodes = {};
	
	let allNodes = this.nodes.heap;
	let nodeNum = allNodes.length;
	
	// Regions are structured like this...
	// [1...sectionsX]
	// [sectionsX+1... 2*sectionsX]
	// [2sx+1...3sx]
	// ...
	// [(sectionsY-1)*sx+1...numOfRegions]
	
	for (let i = 1; i<nodeNum; i++){
		
		let current = this.nodes.heap[i];		
		let x = Math.floor(current.x/100)*100;
		let y = Math.floor(current.y/100)*100;
		
		let possibleR = allMinsX[x]; // possible regions
		
		let maxJ = possibleR.length;
			
		for (let j=0; j<maxJ; j++){
			
			let temp = possibleR[j];
			let tempData = regionData[temp];
			
			if (tempData && (tempData.yMin===y)) {
				
				current.regionID = temp;
				this.regionByNodes[current.name] = temp;
				this.nodes.heap[i] = current;
				
			}
			
		}
		
	}
	
}

/**
	Calculates the h(n) of a node compared with the goal
*/
Graph.prototype.heuristic = function(startNode, goal){
 
	let diffInX = startNode.x - goal.x;
	let diffInY = startNode.y - goal.y;
	let heuristicValue = Math.sqrt((diffInX * diffInX) + (diffInY * diffInY));
	return heuristicValue;
}

/**
	Returns whether there is an edge flag in the source node's region on the edge between the source and target
*/
Graph.prototype.flagged = function (sourceNode, targetNodeName, targetRegion){

	let edge = this.edges[sourceNode.name+targetNodeName];
	let flag = edge.fromFlags [targetRegion];
	
	if (flag===undefined) {
		this.edges[sourceNode.name+targetNodeName].fromFlags[targetRegion] = false;
		flag = false;
	}
	
	return flag;

}

/**
	Calculate and set which edges are in a shortest path into a given region
*/
Graph.prototype.setEdgeFlags = function (){
	
	this.setInternalOrInterfaceorExported();
	this.setFlagsFromExportedNodes();
	
}

/**
	The preprocessing necessary for the modified Dijkstra algorithm. 
	In the preprocessing phase, the network is divided into regions and edge flags are calculated 
	that indicate whether an edge belongs to a shortest path into a given region. 
*/
Graph.prototype.preprocessing = function (){
	this.setRegions();
	this.setEdgeFlags();
}

/**
	For each exported node apply tree calculation. 
	Calculate Dijkstra's with the node as the start (getting a sort of tree).
	Calculate shortest paths per end node tree.
	If the edge is in the shortest path out of the region then set corresponding edge flag.
*/
Graph.prototype.setFlagsFromExportedNodes = function(){
		
	 let nodesToCheck = new MinHeapVertex();
	 nodesToCheck.heap = JSON.parse(JSON.stringify(this.nodes.heap)); 
	 // created so it is easier to go through all the exported nodes
	 
	 let nodeNum = nodesToCheck.heap.length;
	 
	 for (let n=1; n<nodeNum; n++){
		 
		 let current = nodesToCheck.heap[n];	
		 let currentName = current.name;
		 
		 if (current.isExportedNode){
			 
			 let currentHeap = this.dijkAlgo(currentName).nodes.heap;
			 
			 for (let inner=1; inner<nodeNum; inner++){
				 
				 let to = currentHeap[inner];
				 let path = undefined;
				 
				 if (to.name!==currentName){
					 
					 if (to.name){
						 
						 let targetRegion = this.regionByNodes[to.name];
						 path = [];
						 path.unshift(to.name);
						 previous = to.previousNode;
						 
						 while (previous){
							 
							 path.unshift(previous.name);
							 previous = previous.previousNode;
							 
						}
						
						if (path!==undefined && path.length>1){
							
							let maxR = path.length -1;
							let edge = null;
							for (let r=0; r<maxR;r++){
								
								let edge = this.edges[path[r]+path[r+1]];
								
								if (edge.fromFlags.length === 0 ){
									this.edges[path[r]+path[r+1]].fromFlags= new Array(this.maxRegionNumber);
								} 
								
							    this.edges[path[r]+path[r+1]].fromFlags[targetRegion] = true;
							}	
							
						}
				 
					}
		 
				}
	 
			}
	 
		}
		
	 }
	 
}

/**
Sets whether edges are interface or exported. 
Sets whether nodes are internal or exported.
*/
Graph.prototype.setInternalOrInterfaceorExported = function(){
	
	let keys = Object.keys(this.edges);
	let maxK = keys.length;
	
	for (let k=0; k<maxK; k++){
		
		let singleKey = keys[k];
		let singleEdge = this.edges[singleKey];
		let regionFrom = this.regionByNodes[singleEdge.from];
		let regionTo = this.regionByNodes[singleEdge.to];
		
		if (regionFrom !== regionTo) {
			this.edges[singleKey].isInterfaceEdge = true;
		}

	}
	
	let maxN = this.nodes.heap.length;
	
	for (let n=1; n<maxN;n++){
		let currentNode= this.nodes.heap[n];
		let neighbours = currentNode.neighbours;
		
		let continueCheck = true;
		let maxNB =  neighbours.length;
		let nb = 0;
		
		while (nb<maxNB && continueCheck){
			
			let id = currentNode.name+neighbours[nb];
			nb++;
			if (this.edges[id].isInterfaceEdge) { //isExportedNode if incident to at least one interface edge

				this.nodes.heap[n].isExportedNode = true;
				this.edges[id].actualTo.isExportedNode = true;
				continueCheck = false;
				
			}
			
		}		
		
	}
	
}

/**
	Calculates the regions X and Y coordinates based on the x and y coordinates of the nodes in the graph
*/
Graph.prototype.calculateRegions = function(){
	
	let maxX = 0;
	let maxY = 0;
	
	let allNodes = this.nodes.heap;
	let nodeNum = allNodes.length;
	
	// calculate max values for X and Y
	for (let i = 1; i<nodeNum; i++){
		
		let current = this.nodes.heap[i];
		
		if (current.x>maxX){
			maxX = current.x;
		}
		
		if (current.y>maxY){
			maxY = current.y;
		}
		
	}
	
	maxX = Math.ceil(maxX/100)*100; // round up to nearest 100
	maxY = Math.ceil(maxY/100)*100; // round up to nearest 100
	
	let sectionsX = maxX/100;
	let sectionsY = maxY/100;
	
	let numOfRegions = sectionsX*sectionsY;
	
	this.maxRegionNumber = numOfRegions;
	
	// [1...sectionsX] y=0-100, x = 1 to sectionX
	// [sectionsX+1... 2*sectionsX]  y=101-200, x = 1 to sectionX
	// [2sx+1...3sx] y=201-300, x = 1 to sectionX
	// ...
	// [(sectionsY-1)*sx+1...numOfRegions]
	
	let regionData = new Array(numOfRegions);
	let allMinsX = {};
	
	for (let r = 0; r<numOfRegions; r++){
		
		let xMin = (r % sectionsX)*100;		
		let yMin = Math.floor(r/sectionsX)*100;
		
		regionData[r]={
			'xMin': xMin,
			'yMin': yMin
		}
		
		if (allMinsX[xMin]===undefined){
			allMinsX[xMin] =[r];
		} else {
			allMinsX[xMin].push(r);
		}
			
	}
	
	return [regionData, allMinsX];

}

/**
	Modified version of the Dijkstra's algorithm 

	Typically a more efficient algorithm for fast and exact calculation of shortest paths in graphs 
	using nodes coordinates. The method is based on preprocessing. 
	In the path calculation step, only the edges with appropriate flags calculated in the preprocessing phase
	need to be investigated.	
*/
Graph.prototype.dijkAlgoWithPartition = function(startNode, goal){
	
	let maxOfGraph= this.nodes.heap.length;
 
	this.initialiseGraph(startNode);
	
    let nodesToCheck = new MinHeapVertex();
	nodesToCheck.heap = JSON.parse(JSON.stringify(this.nodes.heap));
 
    let tocontinue = true;
    let v = null;  
    
   // This is different to the original Dijkstra's algorithm. The target region is retrieved
	let targetRegion = this.regionByNodes[goal];
	
    while (tocontinue){
        u = nodesToCheck.getMin();
        if (u && u.name!==goal && 
			(u.distanceFromSource!==null || (u.previousNode && u.previousNode.distanceFromSource!==null) )){  
           
			neighbours = u.neighbours;
       
			let maxN = neighbours.length;
			let j = 0;
   
			while ( (j<maxN) && (u!=goal) ){    
             
				v = neighbours[j];
				let alt = u.distanceFromSource+this.edges[u.name+v].weight;
             
				let maxOfCopy = nodesToCheck.heap.length;
				let k = 1;
				let k2 = 1;
				let index = -1;
				let index2 = -1;
				let found = false;
				let found2 = false;
				while ((found == false)&&(k<maxOfGraph)){
        
					if(this.nodes.heap[k].name===v){
						index = k;
						found = true;
					}
					
					k++;
     
				}
				
				while ((found2 == false)&&(k2<maxOfCopy)){
					if(nodesToCheck.heap[k2].name===v){
						index2 = k2;
						found2 = true;
					}
     
					k2++;
     
				}
     
     if ((index!==-1) && (!(this.nodes.heap[index].visited)) && (index2!==-1)){
     
        current = this.nodes.heap[index].distanceFromSource;
		
		// This is different to the original Dijkstra's algorithm. Check if edge has an appropriate flag.
		if (this.flagged(u, v, targetRegion)){
                  if ((current===null) || (alt<current)){
           this.nodes.heap[index].distanceFromSource = alt;
                 this.nodes.heap[index].priority = alt;
           this.nodes.heap[index].previousNode=u;
                   this.nodes.updateHeap(index);
           nodesToCheck.heap[index2].distanceFromSource = alt;  
                nodesToCheck.heap[index2].priority = alt;  
           nodesToCheck.heap[index2].previousNode=u;
           nodesToCheck.updateHeap(index2);
   
          }
     }
       }
     
       j++;
               
      }
        }
       
        let found3 = false;
        let k3 = 1;
        let max33 = this.nodes.heap.length;
        let indexOfU = -1;
        while ((found3 == false)&&(k3<max33)){
   
           if(this.nodes.heap[k3].name===u.name){
          indexOfU = k3;
         found3 = true;
       }
     
       k3++;
     
     }
       
  this.nodes.heap[indexOfU].visited = true;
        nodesToCheck.remove();
        if ( (u && u.name === goal) || (nodesToCheck.heap.length===1) ){
 
          tocontinue = false;
   
        }
 
    }
       
if (goal){
    path = [];
   
 if (u){
     path.unshift(u.name);
      previous = u.previousNode;
 
    while (previous){
 
      path.unshift(previous.name);
      previous = previous.previousNode;
   
    }
     
    }
 
  if (path[0]!==startNode){
   path = undefined;
    }
   return path;
} else{

 return this;
 
}

}


/**
	Same algorithm as Graph.prototype.dijkAlgoWithPartition but returns information for visualisation
*/
Graph.prototype.dijkAlgoWithPartitionWithVisual = function(startNode, goal){
 
	let toReturn = [];	
	this.initialiseGraph(startNode);
    
    let nodesToCheck = new MinHeapVertex();
    nodesToCheck.heap = JSON.parse(JSON.stringify(this.nodes.heap));
 
    let tocontinue = true;
    let v = null;      
   
   	// This is different to the original Dijkstra's algorithm. The target region is retrieved
	let targetRegion = this.regionByNodes[goal];
	
    let maxOfGraph = this.nodes.heap.length;
				
    while (tocontinue){
        
        u = nodesToCheck.getMin();
        toReturn.push(u.name);
        toReturn.push('tipper:'); 
        toReturn.push([u.name, u.distanceFromSource]);  		    
  
        if (u && u.name!==goal && 
		(u.distanceFromSource!==null || (u.previousNode && u.previousNode.distanceFromSource!==null) )){  
           
        		neighbours = u.neighbours;
        		
        		let maxN = neighbours.length;
        		let j = 0;
   
       		while ( (j<maxN) && (u!=goal) ){
       			
       			v = neighbours[j];
				
				// This is different to the original Dijkstra's algorithm. Check if edge has an appropriate flag.
				if (this.flagged(u,v, targetRegion)){
       			toReturn.push(u.name+v);
       			toReturn.push(v);
       			
       			let alt = u.distanceFromSource+this.edges[u.name+v].weight;
       			let maxOfCopy = nodesToCheck.heap.length;
       			let k = 1;
       			let k2 = 1;
       			let indexInGraph = -1;
       			let indexInCopy = -1;
       			let found = false;
       			let found2 = false;
       			
       			while ((found == false)&&(k<maxOfGraph)){
       				
       				if(this.nodes.heap[k].name===v){
       					indexInGraph = k;
       					found = true;
       				}
       				
       				k++;
       			}
       		
       			while ((found2 == false)&&(k2<maxOfCopy)){
                  
                  if(nodesToCheck.heap[k2].name===v){
             			indexInCopy = k2;
            			found2 = true;
          			}
     
     					k2++;
     					
     				}
     				
					if (indexInCopy===-1){
					   toReturn.push('unhighlight:'); 
    		   		toReturn.push(u.name+ v);
					} else {
						toReturn.push('tipper:'); 
						toReturn.push([v, nodesToCheck.heap[indexInCopy].distanceFromSource]);  
					} 				 
    				 
    				if ((indexInGraph!==-1) 
    				&& (indexInCopy!==-1)){
     
        				current = this.nodes.heap[indexInGraph].distanceFromSource;
						
			
        				if ((current===null) || (alt<current)){
 
      					if (this.nodes.heap[indexInGraph].previousNode!==null){
    		   				toReturn.push('unhighlight:'); 
    		   				toReturn.push(this.nodes.heap[indexInGraph].previousNode.name+ v);
    		   			} 
     	  	
     	  	   toReturn.push('tipper:'); 
     	  	   toReturn.push([this.nodes.heap[indexInGraph].name, alt]);  	
       
            this.nodes.heap[indexInGraph].distanceFromSource = alt;
            this.nodes.heap[indexInGraph].priority = alt;
            this.nodes.heap[indexInGraph].previousNode=u;
            this.nodes.updateHeap(indexInGraph);
            
            nodesToCheck.heap[indexInCopy].distanceFromSource = alt;
            nodesToCheck.heap[indexInCopy].priority = alt;  
            nodesToCheck.heap[indexInCopy].previousNode=u;
            nodesToCheck.updateHeap(indexInCopy);
   
          } else if ((current!==null) && (alt>current) && (this.nodes.heap[indexInGraph].previousNode!==null)){
             toReturn.push('unhighlight:'); 
     	 		 toReturn.push(u.name+ v);
          } 
     
					
	   }
     
      
               
      } else{
		  toReturn.push('ignore');
		  toReturn.push(u.name+ v);
	  }
	  j++;
			}
        }

       nodesToCheck.remove();
       
       if ( (u && u.name === goal) || (nodesToCheck.heap.length===1) ){
 
          tocontinue = false;
   
        }
 
    }
       
if (goal){
    path = [];
   
 if (u){
     path.unshift(u.name);
      previous = u.previousNode;
 
    while (previous){
 
      path.unshift(previous.name);
      previous = previous.previousNode;
   
    }
     
    }
 
  if (path[0]!==startNode){
   path = "There is no path between the start and end nodes selected";
    }
   return [path, toReturn];
} else{

 return ["No end goal selected so please look at graph for values", toReturn, this];
 
}
}