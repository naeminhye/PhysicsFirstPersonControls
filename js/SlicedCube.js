// begin test

function makeTest() {
    
    
    var volumeNode = new SlicedCubeNode("modelViewMatrix", 0.05, "pos",
        [[-1.0, -2.0, -1.0],
         [ 1.0, -2.0, -1.0],
         [-1.0,  2.0, -1.0],
         [ 1.0,  2.0, -1.0],
         [-1.0, -2.0,  1.0],
         [ 1.0, -2.0,  1.0],
         [-1.0,  2.0,  1.0],
         [ 1.0,  2.0,  1.0]],
        "tex",
        [[0.0, 0.0, 0.0],
         [1.0, 0.0, 0.0],
         [0.0, 1.0, 0.0],
         [1.0, 1.0, 0.0],
         [0.0, 0.0, 1.0],
         [1,0,1], // can do also like this
         [0.0, 1.0, 1.0],
         [1.0, 1.0, 1.0]]);

    volumeNode._slice();
    return volumeNode;
}

// end test

function SlicedCubeNode(modelViewMatrixId, sliceSpacing, posId, posCorners,
    texId, texCorners) {
  //LeafNode.call(this);
  //this.children = [];
  this._modelViewMatrixId = modelViewMatrixId;
  this._sliceSpacing = sliceSpacing
  this._posId = posId;
  this._posCorners = posCorners;
  this._texId = texId;
  this._texCorners = texCorners;
  this._viewVector = new THREE.Vector3(0,0,1);
}

SlicedCubeNode.prototype._slice = function() {
  this._points = [];
  this._texCoords = [];
  this._indexes = [];

  var cornerDistance = [];
  cornerDistance[0] = this._viewVector.dot(new THREE.Vector3(this._posCorners[0][0], this._posCorners[0][1], this._posCorners[0][2])); // to threejs
  var maxCorner = 0;
  var minDistance = cornerDistance[0];
  var maxDistance = cornerDistance[0];
  for (var i = 1; i < 8; ++i) {
    cornerDistance[i] = this._viewVector.dot(new THREE.Vector3(this._posCorners[i][0], this._posCorners[i][1], this._posCorners[i][2]));
    if (cornerDistance[i] > maxDistance) {
      maxCorner = i;
      maxDistance = cornerDistance[i];
    }
    if (cornerDistance[i] < minDistance) {
      minDistance = cornerDistance[i];
    }
  }

  // Aligning slices
  var sliceDistance =
      Math.floor(maxDistance / this._sliceSpacing) * this._sliceSpacing;

  var activeEdges = [];
  var firstEdge = 0;
  var nextEdge = 0;
  var expirations = new PriorityQueue();

  var createEdge = function(startIndex, endIndex) {
    if (nextEdge >= 12)
      return undefined;
    var activeEdge = {
        expired: false,
        startIndex: startIndex,
        endIndex: endIndex,
    }
    var range = cornerDistance[startIndex] - cornerDistance[endIndex];
    if (range != 0.0) {
      var irange = 1.0 / range;
      activeEdge.deltaPos = vec3.scale(vec3.subtract(
          this._posCorners[endIndex],
          this._posCorners[startIndex],
          [ 0, 0, 0 ]), irange);
      activeEdge.deltaTex = vec3.scale(vec3.subtract(
          this._texCorners[endIndex],
          this._texCorners[startIndex],
          [ 0, 0, 0 ]), irange);

      var step = cornerDistance[startIndex] - sliceDistance;
      activeEdge.pos = vec3.add(
          vec3.scale(activeEdge.deltaPos, step, [ 0, 0, 0 ]),
          this._posCorners[startIndex]);
      activeEdge.tex = vec3.add(
          vec3.scale(activeEdge.deltaTex, step, [ 0, 0, 0 ]),
          this._texCorners[startIndex]);

      vec3.scale(activeEdge.deltaPos, this._sliceSpacing);
      vec3.scale(activeEdge.deltaTex, this._sliceSpacing);
    }
    expirations.push(activeEdge, cornerDistance[endIndex]);
    activeEdge.cur = nextEdge;
    activeEdges[nextEdge++] = activeEdge;
    return activeEdge;
  };

  for (i = 0; i < 3; ++i) {
    var activeEdge = createEdge.call(this, maxCorner,
        this._cornerNeighbors[maxCorner][i]);
    activeEdge.prev = (i + 2) % 3;
    activeEdge.next = (i + 1) % 3;
  }

  var nextIndex = 0;
  while (sliceDistance > minDistance) {
    while (expirations.top().priority >= sliceDistance) {
      var edge = expirations.pop().object;
      if (edge.expired) {
        continue;
      }
      if (edge.endIndex != activeEdges[edge.prev].endIndex &&
          edge.endIndex != activeEdges[edge.next].endIndex) {
        // split this edge.
        edge.expired = true;

        // create two new edges.
        var activeEdge1 = createEdge.call(this, edge.endIndex,
            this._incomingEdges[edge.endIndex][edge.startIndex]);
        activeEdge1.prev = edge.prev;
        activeEdges[edge.prev].next = nextEdge - 1;
        activeEdge1.next = nextEdge;

        var activeEdge2 = createEdge.call(this, edge.endIndex,
            this._incomingEdges[edge.endIndex][activeEdge1.endIndex]);
        activeEdge2.prev = nextEdge - 2;
        activeEdge2.next = edge.next;
        activeEdges[activeEdge2.next].prev = nextEdge - 1;
        firstEdge = nextEdge - 1;
      } else {
        // merge edge.
        var prev;
        var next;
        if (edge.endIndex == activeEdges[edge.prev].endIndex) {
          prev = activeEdges[edge.prev];
          next = edge;
        } else {
          prev = edge;
          next = activeEdges[edge.next];
        }
        prev.expired = true;
        next.expired = true;

        // make new edge
        var activeEdge = createEdge.call(this, edge.endIndex,
            this._incomingEdges[edge.endIndex][prev.startIndex]);
        activeEdge.prev = prev.prev;
        activeEdges[activeEdge.prev].next = nextEdge - 1;
        activeEdge.next = next.next;
        activeEdges[activeEdge.next].prev = nextEdge - 1;
        firstEdge = nextEdge - 1;
      }
    }

    var cur = firstEdge;
    var count = 0;
    do {
      ++count;
      var activeEdge = activeEdges[cur];
      this._points.push(activeEdge.pos[0]);
      this._points.push(activeEdge.pos[1]);
      this._points.push(activeEdge.pos[2]);
      this._texCoords.push(activeEdge.tex[0]);
      this._texCoords.push(activeEdge.tex[1]);
      this._texCoords.push(activeEdge.tex[2]);
      vec3.add(activeEdge.pos, activeEdge.deltaPos);
      vec3.add(activeEdge.tex, activeEdge.deltaTex);
      cur = activeEdge.next;
    } while (cur != firstEdge);
    for (i = 2; i < count; ++i) {
      this._indexes.push(nextIndex);
      this._indexes.push(nextIndex + i - 1);
      this._indexes.push(nextIndex + i);
    }
    nextIndex += count;
    sliceDistance -= this._sliceSpacing;
  }
}

SlicedCubeNode.prototype._cornerNeighbors = [
  [1, 2, 4],
  [0, 5, 3],
  [0, 3, 6],
  [1, 7, 2],
  [0, 6, 5],
  [1, 4, 7],
  [2, 7, 4],
  [3, 5, 6],
];

SlicedCubeNode.prototype._incomingEdges = [
  [-1,  2,  4, -1,  1, -1, -1, -1 ],
  [ 5, -1, -1,  0, -1,  3, -1, -1 ],
  [ 3, -1, -1,  6, -1, -1,  0, -1 ],
  [-1,  7,  1, -1, -1, -1, -1,  2 ],
  [ 6, -1, -1, -1, -1,  0,  5, -1 ],
  [-1,  4, -1, -1,  7, -1, -1,  1 ],
  [-1, -1,  7, -1,  2, -1, -1,  4 ],
  [-1, -1, -1,  5, -1,  6,  3, -1 ],
]