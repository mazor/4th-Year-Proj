/**
	Creates the tippy (copied from the tippy demo)
*/
function makeTippy (node, text){
  let ref = node.popperRef();
   // unfortunately, a dummy element must be passed
   // as tippy only accepts a dom element as the target
   // https://github.com/atomiks/tippyjs/issues/661
   let dummyDomEle = document.createElement('div');
   let tip = tippy( dummyDomEle, {
    onCreate: function(instance){ // mandatory
     // patch the tippy's popper reference so positioning works
     // https://atomiks.github.io/tippyjs/misc/#custom-position
     instance.popperInstance.reference = ref;
    },
    lazy: false, // mandatory
    trigger: 'manual', // mandatory
    // dom element inside the tippy:
    content: function(){ // function can be better for performance
     let div = document.createElement('div');
     div.innerHTML = text;
     return div;
    },
    // your own preferences:
    arrow: true,
    placement: 'bottom',
    hideOnClick: false,
    multiple: true,
    sticky: true
   } );
   return tip;
  };

/**
	Toggles the Cytoscape graph, tippers and the algorithm
*/
function toggleGraphAndTippersAndAlgo(){
	
	let len = window.tippers.length;
	let setAs = "none";
		
	if (document.getElementById('algoInfo').style.display === "none"){
		setAs = "block";
	} 
		
	document.getElementById('algoInfo').style.display = setAs;
	document.getElementById('cy').style.display = setAs;
			
	setAs = !(window.tippers[0].tippy.popper.hidden);
		
	for (let i = 0; i < len; i++){
			
		window.tippers[i].tippy.popper.hidden = setAs;

	}
	
} 
 
/**
	Toggles when the modal is shown or hidden. 
	Hides the Cytoscape graph, tippers, and the algorithm when modal is shown and vice versa.
 */
function toggleModal() {

	if (window.validComparison){ // if the start nodes are valid
		
        window.modal.classList.toggle("showModalComparison");
		toggleGraphAndTippersAndAlgo();
	}

 }

/**
	Close modal if you click away from it
*/
function windowOnClick(event) {
		
	if (event.target === window.modal) {
		toggleModal();
    }
	
}

/**
	On load create the preset graph using the cytoscape library and tippers using the popper extension
*/
document.addEventListener('DOMContentLoaded', function () {
	
	// Creating the graph...
	window.cyGraph = cytoscape({
		container: document.querySelector('#cy'),
		boxSelectionEnabled: false,
		autounselectify: true,
		style: cytoscape.stylesheet()
		.selector('node')
         .css({
			'content': 'data(id)',
			'font-size': '12px',
            'text-valign': 'center',
            'color': 'white',
            'text-outline-width': 2,
            'background-color': '#999',
            'text-outline-color': '#999'
         })
        .selector('edge')
         .css({
			'label' : 'data(weight)',
			'font-size': '10px',
			'curve-style': 'bezier',
			'target-arrow-shape': 'triangle',
            'target-arrow-color': '#ccc',
            'line-color': '#ccc',
            'width': 1
         })
		.selector(':selected')
		 .css({
			'background-color': 'black',
			'line-color': 'black',
			'target-arrow-color': 'black',
			'source-arrow-color': 'black'
		 })
		.selector('.highlighted')
		 .style({
			'background-color': '#61bffc',
			'line-color': '#61bffc',
			'target-arrow-color': '#61bffc',
			'transition-property': 'background-color, line-color, target-arrow-color',
			'transition-duration': '0.5s'
		})
       .selector('.finalPathHighlighted')
		.style({
			'background-color': '#8B0000',
			'line-color': '#8B0000',
			'target-arrow-color': '#8B0000',
			'transition-property': 'background-color, line-color, target-arrow-color',
			'transition-duration': '0.5s'
		})
		.selector('.ignored')
		.style({
			'background-color': '#2b2d2f',
			'line-color': '#2b2d2f',
			'target-arrow-color': '#2b2d2f',
			'line-style': 'dotted'
		})
		.selector('.faded')
		 .css({
			'opacity': 0.25,
			'text-opacity': 0
		 }),
		elements: {
			nodes: [
				{ data: { id: 'node1', name: 'node1', weight: '0' }, position: { x: 103.125, y: 125 } },
				{ data: { id: 'node2', name: 'node2', weight: '0' }, position: { x: 249.375, y: 170 } },
				{ data: { id: 'node3', name: 'node3', weight: '0' }, position: { x: 581.875, y: 125 } },
				{ data: { id: 'node4', name: 'node4', weight: '0' }, position: { x: 525.625, y: 110 } },
				{ data: { id: 'node5', name: 'node5', weight: '0' }, position: { x: 103.125, y: 375 } },
				{ data: { id: 'node6', name: 'node6', weight: '0' }, position: { x: 249.375, y: 315 } },
				{ data: { id: 'node7', name: 'node7', weight: '0' }, position: { x: 415.625, y: 375 } }
			],
			edges: [
				{ data: { id: 'node1node3', source: 'node1', target: 'node3', weight: '100' } },
				{ data: { id: 'node1node2', source: 'node1', target: 'node2', weight: '3' } },
				{ data: { id: 'node1node4', source: 'node1', target: 'node4', weight: '4' } },
				{ data: { id: 'node4node3', source: 'node4', target: 'node3', weight: '3' } },
				{ data: { id: 'node4node5', source: 'node4', target: 'node5', weight: '8' } },
				{ data: { id: 'node5node6', source: 'node5', target: 'node6', weight: '10' } },
				{ data: { id: 'node2node7', source: 'node2', target: 'node7', weight: '9' } },
				{ data: { id: 'node5node7', source: 'node5', target: 'node7', weight: '50' } }
			]
		},
		layout: {
			name: 'preset',
			padding: 10
		}
	});
	
	cyGraph.on('tap', 'node', function(e){
		let node = e.cyTarget;
		let neighborhood = node.neighborhood().add(node);
		cyGraph.elements().addClass('faded');
		neighborhood.removeClass('faded');
	});
	
	cyGraph.on('tap', function(e){
		if( e.cyTarget === cy ){
			cyGraph.elements().removeClass('faded');
		}
	});
	
	document.getElementById('myfile').addEventListener('change', handleFileSelect, false);
	cyGraph.panningEnabled( false );
	cyGraph.userPanningEnabled(false);
	cyGraph.zoomingEnabled( false );
	cyGraph.userZoomingEnabled( false );
	cyGraph.boxSelectionEnabled( false );

	let a = cyGraph.getElementById('node1');
	let b = cyGraph.getElementById('node2');
	let c = cyGraph.getElementById('node3');
	let d = cyGraph.getElementById('node4');
	let e = cyGraph.getElementById('node5');
	let f = cyGraph.getElementById('node6');
	let g = cyGraph.getElementById('node7');
	
	let tippyA = makeTippy(a, '0');
	tippyA.show();
	let tippyB = makeTippy(b, 'inf');
	tippyB.show();
	let tippyC = makeTippy(c, 'inf');
	tippyC.show();
	let tippyD = makeTippy(d, 'inf');
	tippyD.show();
	let tippyE = makeTippy(e, 'inf');
	tippyE.show();
	let tippyF = makeTippy(f, 'inf');
	tippyF.show();
	let tippyG = makeTippy(g, 'inf');
	tippyG.show();
 
	window.tippers = [];
	window.tippers.push({'name': 'node1', 'tippy': tippyA});
	window.tippers.push({'name': 'node2', 'tippy': tippyB});
	window.tippers.push({'name': 'node3', 'tippy': tippyC});
	window.tippers.push({'name': 'node4', 'tippy': tippyD});
	window.tippers.push({'name': 'node5', 'tippy': tippyE});
	window.tippers.push({'name': 'node6', 'tippy': tippyF});
	window.tippers.push({'name': 'node7', 'tippy': tippyG});
   
	updateAlgorithm();
	
	window.theGraph = createJSGraph();
	window.modal = document.querySelector(".modalForComparison");
	window.trigger = document.querySelector(".compareAlgo");
	window.closeButton = document.querySelector(".close-button");

	trigger.addEventListener("click", toggleModal);
	closeButton.addEventListener("click", toggleModal);
	window.addEventListener("click", windowOnClick);

});

/**
	Removes all highlights from the edges and nodes in the graph
*/
function resetToUnhighlighted (){
 
	let allNodes = window.cyGraph.nodes();
	let numOfNodes = allNodes.length;
 
	for (let n = 0; n<numOfNodes; n++){
		allNodes[n].removeClass('highlighted');
		allNodes[n].removeClass('finalPathHighlighted');
	}
 
	let allEdges = window.cyGraph.edges();
	let numOfEdges = allEdges.length;
	
	for (let e = 0; e<numOfEdges; e++){
		allEdges[e].removeClass('highlighted');
		allEdges[e].removeClass('finalPathHighlighted');
		allEdges[e].removeClass('ignored');

	}
 
}

/**
	Highlights, unhighlights, and updates tippers of nodes and edges from the array supplied as stated by the array
*/
function highlightThis (whatToHighlight){
 
	resetToUnhighlighted ();
	let i = 0;
	let finalPath = false;
 
	let speedChoice = document.getElementById('speedChoice');
	let timer =  speedChoice.options[speedChoice.selectedIndex].value;
	
	document.getElementById('algoInfo').innerHTML = window.algoSection[1];
 
	let highlightNextEle = function(){
		if( i < whatToHighlight.length ){
			if(whatToHighlight[i]==='unhighlight:'){
				
				i++; // skip to the next element in the array so that it can be unhighlighted
				whatToHighlight[i].removeClass('highlighted');
				
			} else if (whatToHighlight[i]==='tipper:'){
				
				i++; 
				// skip to the next element in the array so that its corresponding tipper can be updated
				let tippInfo = whatToHighlight[i];
				editTipper(tippInfo[0], tippInfo[1]);
				
			} else if (whatToHighlight[i]==='ignore'){
				
				i++; // skip to the next element in the array so that it can be edited to show it's ignored
				whatToHighlight[i].addClass('ignored');
				
			} else if (whatToHighlight[i]==='finalPath'){
   
				finalPath = true;
				timer = 10;
   
			} else if (!finalPath){
				
				whatToHighlight[i].addClass('highlighted');
					
			} else { // highlights the edges in red to show final path
				
				document.getElementById('algoInfo').innerHTML = window.algoSection[0]+window.algoSection[1];
				whatToHighlight[i].removeClass('highlighted');
				whatToHighlight[i].addClass('finalPathHighlighted');
				
			}
					
			setTimeout(highlightNextEle, timer);
		
			i++;
			
			if (i===whatToHighlight.length){
				document.getElementById("pageButton").disabled = false;
			}
    
		}
			
	};
 
	// kick off first highlight
	highlightNextEle();
 
}

/**
	Gives instructions to the user on how to create a file to load.
	Disables other options when instructions are visible.
*/
function makeOwnGraph(){
 
	let textArea = document.getElementById("makingGraphInfo");
	toggleGraphAndTippersAndAlgo();
	if (textArea.style.display==="none"){
 
		let infomessage =  "Click the button again to make this info disappear and the graph reappear \n"
		+ "Want to create your Graph?" 
		+ " Open the folder 'load graphs from here' and create a file there. \n"
		+ "The file should be in the format: \n"
		+ "{ \"group\": \"nodes\", \"data\": { \"id\": \"node1IDHere\","
		+ "\"name\": \"node1NameHere\" }, \"position\": { \"x\": 500.625, \"y\": 324 } }#\n"
		+ "{ \"group\": \"nodes\", \"data\": { \"id\": \"node2IDHere\","
		+ "\"name\": \"node2NameHere\" }, \"position\": { \"x\": 600.625, \"y\": 350 } }#\n"
		+ "for nodes (IDs should not contain '-')\n"
		+ "(note: x and y are used in the A* algorithm calculations as well "
		+ "as general visualisation for all the algorithms)\n"
		+ "and in the format: \n"
		+ "{ \"group\": \"edges\", \"data\": { \"id\": \"sourceID+targetID\""
		+ ", \"name\": \"edgeNameHere\", \"source\": \"sourceNodeIDGoesHere\","
		+ "\"target\": \"endNodeIDGoesHere\", \"weight\": 100} }# "
		+ "for edges (weight value should not be in quotes). \n" 
		+ "Each edge should have an id that is the source ID followed by the goal ID \n"
		+ "e.g. 'AH' if the edge goes from 'A' to 'H') \n"
		+ "Make sure both nodes and edges are separated by '#' otherwise it will not load properly. \n"
		+ "Final line should not have a '#' after it";
 
		document.getElementById("makingGraphInfo").innerHTML = infomessage;
		textArea.style.display="block";
		document.getElementById("pageButton").disabled = true;
		document.getElementById("compareAlgo").disabled = true;
		document.getElementById("createRandom").disabled = true;
		document.getElementById("myfile").disabled = true;
  
	} else{
 
		textArea.style.display="none";
		document.getElementById("pageButton").disabled = false;
		document.getElementById("compareAlgo").disabled = false;
		document.getElementById("createRandom").disabled = false;
		document.getElementById("myfile").disabled = false;

	}
 
 }

/**
	Updates algorithm information shown
*/
function updateAlgorithm(){
 
	let algoChoice = document.getElementById('algoChoice');
	let algoChosen = algoChoice.options[algoChoice.selectedIndex].value;
	getAlgorithmMessages(algoChosen);
	document.getElementById('algoInfo').innerHTML = window.algoSection[0];
 
}
 
function start(){

	if(!window.editing){
let fileName = document.getElementById('myfile');
let algoChoice = document.getElementById('algoChoice');
let startNode = document.getElementById("startNode").value;
document.getElementById("pathInfo").style.display="block";
if (startNode===''){
 alert('Start node is required! Fill it in before pressing start again!');
} else{
 
if (setNewStartNode(startNode)){
 
 let algoChosen = algoChoice.options[algoChoice.selectedIndex].value;

 let endNode = document.getElementById("endNode").value;
if (endNode && (cyGraph.getElementById(endNode).position('x')===undefined)){
	endNode = null;
   if (algoChosen!=='3'){
	alert('Chosen end node is not part of the graph. Algorithm will continue with no end node');
   }
}
getAlgorithmMessages(algoChosen);
 if (algoChosen === '1'){ // Dijkstra's algorithm

let paths = window.theGraph.dijkAlgoWithVisual(startNode, endNode);
let paths0 = paths[0];
document.getElementById('algoInfo').innerHTML = window.algoSection[0];
document.getElementById("pathInfo").innerText = "Path is: " + paths0;
let highlightingPath = paths[1];
let maxf = highlightingPath.length;
let toHighlight = [];
for (let f = 0; f < maxf; f++){
 let id = highlightingPath[f];
 if (id==='unhighlight:'){
 toHighlight.push(id);
 } else if (id==='tipper:'){
   toHighlight.push(id);
   f++;
   id = highlightingPath[f];
   toHighlight.push(id);
 } else{
  toHighlight.push(window.cyGraph.$('#'+id));
 }
 
}
if ((paths0!=="No end goal selected so please look at graph for values")
	&&(paths0!=="There is no path between the start and end nodes selected")){
	toHighlight.push("finalPath");
let startN = paths0[0];
let endN = paths0[1];
let maxh = paths0.length - 1;
toHighlight.push(window.cyGraph.$('#'+startN));
toHighlight.push(window.cyGraph.$('#'+startN+endN))
for (let h = 1; h < maxh; h++){
  startN = paths0[h];
 endN = paths0[h+1];
 toHighlight.push(window.cyGraph.$('#'+startN));
 toHighlight.push(window.cyGraph.$('#'+startN+endN));
}
toHighlight.push(window.cyGraph.$('#'+endN));
}
document.getElementById("pageButton").disabled = true;

highlightThis (toHighlight);
 } else if (algoChosen === '2'){ // Dijkstra's partitioned algorithm

let paths = window.theGraph.dijkAlgoWithPartitionWithVisual(startNode, endNode);
let paths0 = paths[0];
document.getElementById('algoInfo').innerHTML = window.algoSection[0];
document.getElementById("pathInfo").innerText = "Path is: " + paths0;
let highlightingPath = paths[1];
let maxf = highlightingPath.length;
let toHighlight = [];
for (let f = 0; f < maxf; f++){
 let id = highlightingPath[f];
 if (id==='unhighlight:' || id==='ignore'){
 toHighlight.push(id);
 } else if (id==='tipper:'){
   toHighlight.push(id);
   f++;
   id = highlightingPath[f];
   toHighlight.push(id);
 } else{
  toHighlight.push(window.cyGraph.$('#'+id));
 }
 
}

if ((paths0!=="No end goal selected so please look at graph for values")
	&&(paths0!=="There is no path between the start and end nodes selected")){
toHighlight.push("finalPath");
let startN = paths0[0];
let endN = paths0[1];
let maxh = paths0.length - 1;
toHighlight.push(window.cyGraph.$('#'+startN));
toHighlight.push(window.cyGraph.$('#'+startN+endN))
for (let h = 1; h < maxh; h++){
  startN = paths0[h];
 endN = paths0[h+1];
 toHighlight.push(window.cyGraph.$('#'+startN));
 toHighlight.push(window.cyGraph.$('#'+startN+endN));
}
toHighlight.push(window.cyGraph.$('#'+endN));
}
document.getElementById("pageButton").disabled = true;

highlightThis (toHighlight);
 
 } else { // A* Algorithm
 
  if (endNode === ''){
   alert('End node is required for the A* algorithm! Fill it in before pressing start again!');
  } else if (endNode === null){
	   alert('Your chosen end node is not part of the graph! Please choose a new one. End node is required for the A* algorithm!');
  } else {
 
   let paths = astarAlgoVisual(window.theGraph, startNode, endNode);
   let visualPath = paths[2];
 
   let maxf = visualPath.length;
 
 let toHighlight = [];
for (let f = 0; f < maxf; f++){
 let id = visualPath[f];
 if (id==='unhighlight:'){
 toHighlight.push(id);
 } else if (id==='tipper:'){
   toHighlight.push(id);
   f++;
   id = visualPath[f];
   toHighlight.push(id);
 } else{
  toHighlight.push(window.cyGraph.$('#'+id));
 }
 
}
toHighlight.push("finalPath");
let paths0 = paths[0];
if (paths0!==false) {
 document.getElementById("pathInfo").innerText = "Path is: " + paths0;
 let startN = paths0[0];
let endN = paths0[1];
let maxh = paths0.length - 1;
toHighlight.push(window.cyGraph.$('#'+startN));
toHighlight.push(window.cyGraph.$('#'+startN+endN))
for (let h = 1; h < maxh; h++){
  startN = paths0[h];
 endN = paths0[h+1];
 toHighlight.push(window.cyGraph.$('#'+startN));
 toHighlight.push(window.cyGraph.$('#'+startN+endN));
}
toHighlight.push(window.cyGraph.$('#'+endN));
 
} else {
 document.getElementById("pathInfo").innerText = "Path is: There is no path between the start and end nodes selected";
}
document.getElementById("pageButton").disabled = true;
highlightThis (toHighlight);
 
  }
 
 }
 
} else{
  alert('An EXISTING start node is required! (Please check your spelling before trying again)');
}
	}} else{
		alert("Please click 'End Edit' if you are done editing. Only then can you start the algorithm");
	}

}

function handleFileSelect(event){
  const reader = new FileReader()
  reader.onload = handleFileLoad;
  reader.readAsText(event.target.files[0])
}

function handleFileLoad(event){
 
let fileInsides = event.target.result;
let removedNodes = cyGraph.remove(cyGraph.nodes());
let ar = fileInsides.split('#');
let max1 = ar.length;
let alertNeeded = false;
for (let i = 0; i<max1;i++){
	let singleLine = ar[i];
	if (singleLine){
		if (singleLine.indexOf('"weight": -')===-1){
			cyGraph.add(JSON.parse(singleLine));
		} else {
			alertNeeded = true;
		}
	}
}

if (alertNeeded){
	alert ('Weights must be non-negative. Not all edges will appear!')
}
removeOldTippers();
makeNewTippers();

window.theGraph = createJSGraph();

}

function editTipper(nodeId, distance){
	
	if (distance===null) {
		distance = "inf";
	}
 
 let maxi = window.tippers.length;
 for (let i = 0; i<maxi; i++){
 
  let nameTip = window.tippers[i].name.toLowerCase();
  if (nameTip===nodeId.toLowerCase()){
   window.tippers[i].tippy.popper.innerText = distance;
  }
 }
}

function getAlgorithmMessages(algorithmnSelection){
 
 window.algoSection = [];
 
 let messagePart = "";
 if (algorithmnSelection === '1'){ // Dijkstra's algorithm
 
  //http://www.gitta.info/Accessibiliti/en/html/Dijkstra_learningObject1.html
  messagePart = "// Initialization \n"
   + "for each vertex v in Graph: \n"
   + " // initial distance from source to vertex v is set to infinite \n"
   + " dist[v] := infinity \n"
   + " // Previous node in optimal path from source \n"
   + " previous[v] := undefined \n"
   + "END FOR \n"
   + "// Distance from source to source \n"
   + "dist[source] := 0 \n"
   + " // all nodes in the graph are unoptimized - thus are in Q \n"
   + "Q := the set of all nodes in Graph \n";
  algoSection.push(messagePart);
  messagePart = "while Q is not empty: // main loop \n"
   + "u := node in Q with smallest dist[ ] \n"
   + "remove u from Q \n"
   + "for each neighbor v of u:  // where v has not yet been removed from Q. \n"
   + "alt := dist[u] + dist_between(u, v) \n"
   + "if alt < dist[v] // Relax (u,v)\n"
   + "dist[v] := alt \n"
   + "previous[v] := u \n"
   + "END IF \n"
   + "END FOR \n"
   + "END WHILE \n"
   + "return previous[ ]";
  
  algoSection.push(messagePart);
 
 } else if (algorithmnSelection === '2'){ // Dijkstra's partitioned algorithm
 

  messagePart = "dijkstra(Graph& g, Node* source, Node* target) { \n"
  + "int target_region = target->region(); // different from original Dijkstra \n"
  + "// initialize all nodes: \n"
  + "Node* v; \n"
  + "forall_nodes(v,g) v->dist = ∞; \n"
  + "// initialize priority queue: \n"
  + "priority_queue q; \n"
  + "source->dist = 0; \n"
  + "q.insert(source); \n"
 
  algoSection.push(messagePart);

  messagePart = "while ((v = q.del_min())) { // while q not empty \n"
  + "if (v == target) return v->dist; \n"
  + "Node* w; \n"
  + "Edge* e; \n"
  + "forall_adj_edges(w,v,e,g) { // scan node v \n"
  + "if (! flagged(v,e,target_region)) continue; // different from original Dijkstra \n"
  + "if (w->dist > v->dist + e->length) { \n "
  + "w->dist = v->dist + e->length; \n"
  + "if (q.member(w)) q.update(w); \n"
  + "else q.insert(w); \n"
  + "} \n"
  + "} \n"
  + "} \n"
  + "return ∞; \n"
  + "} \n";
  algoSection.push(messagePart);
 
 } else { // A* Algorithm
 
  messagePart = "function A*(start, goal) \n"
  + " open_list = set containing start \n"
  + " closed_list = empty set \n"
  + " start.g = 0 \n"
  + " start.f = start.g + heuristic(start, goal) \n";
 
  algoSection.push(messagePart);
 
  messagePart = " while open_list is not empty \n";
  messagePart = messagePart + " current = open_list element with lowest f cost \n"
  + " if current = goal \n"
  + "  return construct_path(goal) // path found \n"
  + " remove current from open_list \n"
  + " add current to closed_list \n"
  + " for each neighbor in neighbors(current) \n"
  + "   if neighbor not in closed_list \n"
  + "    neighbor.f = neighbor.g + heuristic(neighbor, goal) \n"
  + "    if neighbor is not in open_list \n"
  + "     add neighbor to open_list \n"
  + "    else \n"
  + "     openneighbor = neighbor in open_list \n"
  + "     if neighbor.g < openneighbor.g \n"
  + "        openneighbor.g = neighbor.g \n"
  + "        openneighbor.parent = neighbor.parent \n"
  + " return false // no path exists \n \n";
 
  messagePart = messagePart + "function neighbors(node) \n"
  + "  neighbors = set of valid neighbors to node // check for obstacles here \n"
  + "  for each neighbor in neighbors \n"
  + "    neighbor.g = node.g + cost \n"
  + "    neighbor.parent = node \n"
  + "  END FOR \n"
  + "  return neighbors \n \n";
 
  messagePart = messagePart + "function construct_path(node) \n";
  messagePart = messagePart + "  path = set containing node \n";
  messagePart = messagePart + "  while node.parent exists \n";
  messagePart = messagePart + "    node = node.parent \n";
  messagePart = messagePart + "    add node to path \n";
  messagePart = messagePart + "  END WHILE \n";
  messagePart = messagePart + "  return path";
 
  algoSection.push(messagePart);
 
 }
 
}

/**
 Setting tippers to be inf if they aren't for the start node and 0 if it is
*/
function setNewStartNode(startNode) {
 
 let toReturn = false;
 let maxi = window.tippers.length;
 for (let i = 0; i<maxi; i++){
 
  let nameTip = window.tippers[i].name.toLowerCase();
  if (nameTip===startNode.toLowerCase()){
   window.tippers[i].tippy.popper.innerText = '0';
   toReturn = true;
  } else{
   window.tippers[i].tippy.popper.innerText = 'inf';
  }
 }
 
 return toReturn;
}


/**
 Removes all the existing tippers
*/
function removeOldTippers(){
 let maxi = window.tippers.length;
 for (i = 0; i<maxi; i++){
  window.tippers[i].tippy.destroy();
 }
 window.tippers = [];
}

function makeNewTippers(){
 let nodes = cyGraph.nodes();
 let maxi = nodes._private.map.size;
 let iterator1 = nodes._private.map.keys();
 
 for (let i = 0; i<maxi; i++){
 
  let id = iterator1.next().value;
     if((typeof(id) !== 'undefined') && (id.indexOf('-')===-1)){

  let a = cyGraph.getElementById(id);
  let tippyA = makeTippy(a, 'inf');
  tippyA.show();
 
  window.tippers.push({'name': id, 'tippy': tippyA});
	 }
 }
}

function createJSGraph(){
 
 let g = new Graph();
 let nodes = cyGraph.nodes();
 let maxi = nodes._private.map.size;
 let iterator1 = nodes._private.map.keys();
 
 for (let i = 0; i<maxi; i++){
 
  let id = iterator1.next().value;
 
    if((typeof(id) !== 'undefined') && (id.indexOf('-')===-1)){
     let xy = nodes[i]._private.position;
 
     g.addNode(id, xy.x, xy.y);
    
    }
 }
 
 let edges = cyGraph.edges();
 let maxj = edges.length;
 
 for (let j = 0; j<maxj; j++){
 
  let singleEdge = edges[j]._private.data;
  g.addEdge(singleEdge.source, singleEdge.target, Number(singleEdge.weight));
 }
 
 g.preprocessing();
 
 return g;
}

function createRandomGraph(){
	window.editing = false;
	let numberOfNodes= parseInt(document.getElementById('nodeNumber').value);
	if (Number.isInteger(numberOfNodes) && numberOfNodes>0 && numberOfNodes<41){
		
	document.getElementById('changeEditStatus').style.display="inline-block";
	
	let removedNodes = cyGraph.remove(cyGraph.nodes());
	let half = Math.ceil(numberOfNodes/2);
	let minY= window.innerHeight*0.2;
	let maxY = window.innerHeight*0.5;
	let minX = 125;
	let maxX = window.innerWidth*0.6;
	let diffInX = maxX-minX -50;
	let diffInY = maxY-minY;
	
	for (let i = 1; i<=numberOfNodes; i++){
		let remainders = i % half;
		let xCoord;
		let yCoord;
	
		xCoord = minX + (diffInX/half)*remainders;
		yCoord = minY + (diffInY/(numberOfNodes))*remainders;
		

		if ( i>half){
		//	xCoord = xCoord + 100;
			yCoord = yCoord + 170;
		}
		
		if (xCoord>maxX){
			xCoord = maxX;
		}
		if (yCoord>maxY){
			yCoord = maxY;
		}
		
		let singleLine = { "group": "nodes", "data": { 'id': 'node'+i, "name": i }, "position": { x: xCoord, y: yCoord } };

cyGraph.add(singleLine);
	}
	
	for (let j = 1; j<=numberOfNodes;j++){
		
		let degree = 2;
		if (numberOfNodes<=degree){
			degree = numberOfNodes -1;
		}
		let arr = [];
		while(arr.length < degree ){
			let r = Math.floor(Math.random() * numberOfNodes) + 1;
			if((r!==j)&&(arr.indexOf(r) === -1)) arr.push(r);
		}
		
		for (let a = 0; a<degree; a++){
			let to = 'node'+arr[a];

			let dx = cyGraph.getElementById('node'+j).position('x') - cyGraph.getElementById(to).position('x') ;
			let dy = cyGraph.getElementById('node'+j).position('y') - cyGraph.getElementById(to).position('y') ;
			let weight = Math.floor(Math.sqrt((dx*dx)+(dy*dy))/1)+1;
			let id = 'node'+j+""+to;
			
			singleLine = { "group": "edges", "data": { "id": id, "name": "Ed"+j, "source": 'node'+j, "target": to, "weight": weight} };

		cyGraph.add(singleLine);
		}
	}

removeOldTippers();
makeNewTippers();

window.theGraph = createJSGraph();
	
} else{
	alert("Please enter a valid N. Make sure it is a positive integer that is less than or equal to 40.");
}
}

function changeEditStatus(){
	if (!window.editing){
		document.getElementById('fromLbl').style.display="inline-block";
		document.getElementById('from').style.display="inline-block";
		document.getElementById('toLbl').style.display="inline-block";
		document.getElementById('to').style.display="inline-block";
		document.getElementById('add').style.display="inline-block";
		document.getElementById('remove').style.display="inline-block";
		document.getElementById('changeEditStatus').innerText = "End Edit";
				document.getElementById('save').style.display="none";

		window.editing = true;
	} else {
		document.getElementById('fromLbl').style.display="none";
		document.getElementById('from').style.display="none";
		document.getElementById('toLbl').style.display="none";
		document.getElementById('to').style.display="none";
		document.getElementById('add').style.display="none";
		document.getElementById('remove').style.display="none";
		document.getElementById('changeEditStatus').innerText = "Begin Edit";
		document.getElementById('save').style.display="inline-block";
		window.editing = false;
		window.theGraph = createJSGraph();
	}
	
}

function addEdge(){
	let sourceNode = document.getElementById('from').value;
	let targetNode = document.getElementById('to').value;
	
	let cySource = cyGraph.getElementById(sourceNode);
	let cyTarget = cyGraph.getElementById(targetNode);
	
	if (sourceNode === '' || targetNode === ''){
		alert("Source and target nodes are both required.")
	} else if (cySource.position('x')===undefined || cyTarget.position('x')===undefined){
		alert("EXISTING source and target nodes are required.")
	} else{	
	
	let id = sourceNode+targetNode;
	
	if (cyGraph.getElementById(id).position('x')!==undefined){
		alert('Edge already exists!');
	} else{
		if (cySource.position('x') && cyTarget.position('x')){
			let dx = cySource.position('x') - cyTarget.position('x') ;
			let dy = cySource.position('y') - cyTarget.position('y') ;
			let weight = Math.floor(Math.sqrt((dx*dx)+(dy*dy))/1)+1;
			
			
			singleLine = { "group": "edges", "data": { "id": id, "name": id, "source": sourceNode, "target": targetNode, "weight": weight} };
		cyGraph.add(singleLine);
	} else {
		alert('Please choose valid values for the nodes. Note: values are case sensitive');
	}	

		
	}

	}
}

function removeEdge(){
	let sourceNode = document.getElementById('from').value;
	let targetNode = document.getElementById('to').value;
	
	if (sourceNode === '' || targetNode === ''){
		alert("Source and target nodes are both required.")
	} else if (cyGraph.getElementById(sourceNode).position('x')===undefined 
	|| cyGraph.getElementById(targetNode).position('x')===undefined){
		alert("EXISTING source and target nodes are required.")
	} else{	
	let toRemove = cyGraph.getElementById(sourceNode+targetNode);
	cyGraph.remove(toRemove);	
	}
}

function saveCyGraphToFile(){
	alert ('saving...');
	
	let toSave = "";
	
	let nodes = cyGraph.nodes();
	let maxi = nodes._private.map.size;
	let iterator1 = nodes._private.map.keys();
	for (let i = 0; i<maxi; i++){
		let id = iterator1.next().value;
			if((typeof(id) !== 'undefined') && (id.indexOf('-')===-1)){

				let a = cyGraph.getElementById(id);
				let x = a.position('x');
				let y = a.position('y');
				
				toSave+='{ "group": "nodes", "data": { "id": "'+id+'", "name": "'+id+'" }, "position": { "x":'+ x +', "y": '+ y +' } }#';
			}
	}
	
	
	let theEdges = cyGraph.edges();
	let maxe = theEdges._private.map.size;
	let iterator2 = theEdges._private.map.keys();
	
	for (let e = 0; e<maxe; e++){
		let id = iterator2.next().value;
		let data = cyGraph.getElementById(id)._private.data;
		let weight = data.weight;
		let source = data.source;
		let target = data.target;
		let name = data.name;
		
		toSave+='{ "group": "edges", "data": { "id": "'+id+'", "name": "'+name+'", "source": "'+source+'", "target": "'+target+'", "weight": '+weight+'} }#';
	}
		toSave = toSave.slice(0, -1); //remove last # after nodes and edges done. Graph may have 0 edges.
	let blob = new Blob([toSave],
                { type: "text/plain;charset=utf-8" });
	saveAs(blob, "randomGraph.txt");
				
}

function compareAlgorithms(){
	
	window.validComparison = false;

	let startNode = document.getElementById("startNode").value;
	let endNode = document.getElementById("endNode").value;
	if (startNode==='' || endNode===''){
		alert('Start and end nodes are required! Fill them in before pressing to compare again!');
	} else if ((cyGraph.getElementById(startNode).position('x')===undefined)||
		(cyGraph.getElementById(endNode).position('x')===undefined)) {
		alert('EXISTING start and end nodes are required! Fill them in before pressing to compare again!');
	} else{
		window.validComparison = true;
		let path = 	window.theGraph.dijkAlgo(startNode, endNode);
		if (!Array.isArray(path)){
			path = "No Path Exists";
		}
	
		document.getElementById("pathForComparison").textContent = path;

		let startTime = (new Date()).getTime();
		let runs = 1000;
		while (runs!==0){
			window.theGraph.dijkAlgo(startNode, endNode);
			runs--;
		}
	
		let endTime = (new Date()).getTime();
		let dijkTimeTaken = endTime-startTime;	
		let max = dijkTimeTaken;
		let min = dijkTimeTaken;
		
		startTime = (new Date()).getTime();
		runs = 1000;
		while (runs!==0){
			window.theGraph.dijkAlgoWithPartition(startNode, endNode);
			runs--;
		}
		endTime = (new Date()).getTime();
		
		let dijkPartTimeTaken = endTime-startTime;
		if (dijkPartTimeTaken>max){
			max = dijkPartTimeTaken;
		} else {
			min = dijkPartTimeTaken;
		}	
	
		startTime = (new Date()).getTime();
		runs = 1000;
		while (runs!==0){
			astarAlgo(window.theGraph, startNode, endNode);
			runs--;
		}
		
		endTime = (new Date()).getTime();
		let astarTimeTaken = endTime-startTime; 
		
		if (astarTimeTaken>max){
			max = astarTimeTaken;
		}
		
		if (astarTimeTaken<min){
			min = astarTimeTaken;
		}
		
		max = Math.ceil(max/100)*100;
		min = Math.floor(min/100)*100;
		range = max - min;
		doPercentage = ((dijkTimeTaken-min)/range)*100;
		dpPercentage = ((dijkPartTimeTaken-min)/range)*100;
		asPercentage = ((astarTimeTaken-min)/range)*100;

		document.getElementById("dijkOrigBar").textContent = dijkTimeTaken +"ms";
		document.getElementById("dijkPartBar").textContent = dijkPartTimeTaken +"ms";
		document.getElementById("aStarBar").textContent = astarTimeTaken +"ms";

		document.getElementById("dijkOrigBar").style.width = doPercentage+"%";
		document.getElementById("dijkPartBar").style.width = dpPercentage+"%";
		document.getElementById("aStarBar").style.width = asPercentage+"%";
	
}

 
}