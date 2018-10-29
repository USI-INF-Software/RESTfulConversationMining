var drawG = function(g, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj){
  for(var key in nodes){
    var size = Object.keys(nodes[key]).length;
    if(size == 1){
      var status = Object.keys(nodes[key])[0]
      var str = "inXOR-"+key
      let word = setUpClassForDifferentIpTp(nodes, key, status);
      updateComparisonUniqueness(word, comparisonTableData, key, status);
      hasStatus(statusObj, status);
      let patternClazz = getPatternClassName(key, status);
      let clazz = getClassForNode(word, patternClazz, nodes, key, status, false);
      if(incomingXorNodes[key] !== undefined) checkIfIncomingXorExists(nodes, key, incomingXorNodes, Object.keys(incomingXorNodes[key]).length, "inXOR-"+key)
      let label = nodes[key][status].statusArray[0].key + '\n \n' + status + '\n' + "(" + nodes[key][status].statusArray.length + ")";
      let id = key+' '+status;
      g.setNode(id, { shape: "reqresp",
      label : label,
      class: clazz});
      if(nodes[key][status].outgoingXOR){
        g.setNode("XOR-"+id, {label: "X", shape: "large_gateway", class: "type-XOR outgoingXOR"});
      }
      if((nodes[key][status].statusArray.length) > 1 && Object.keys(incomingXorNodes[key]).length > 1){
        var str = "inXOR-"+key
        g.setNode(str, {label: "X", shape: "large_gateway", class: "type-XOR incomingXOR"});
      }
    }
    else{
      var st = Object.keys(nodes[key])[0]
      var word = setUpTotalClassForDifferentIpTp(nodes, key);
      let patternClazz = getPatternClassName(key, undefined);
      updateComparisonUniqueness(word, comparisonTableData, key, undefined);
      let clazz = getClassForNode(word, patternClazz, nodes, key, "", false);
      let label = nodes[key][st].statusArray[0].key + '\n' + "(" + totalRequests[key] + ")";
      g.setNode(key, {shape: "request", label: label, class: clazz});
      //this is the gateway between request and multiple responses
      g.setNode("middleXOR-"+key,{label: "X", shape: "small_gateway", class: "type-XOR middleXOR"});
      var str = "inXOR-"+key
      if(Object.keys(incomingXorNodes[key]).length > 1) g.setNode(str, {label: "X", shape: "incoming_gateway", class: "type-XOR incomingXOR"});
      for(var status in nodes[key]){
        let id = key+' '+status;
        word = setUpClassForDifferentIpTp(nodes, key, status);
        patternClazz = getPatternClassName(key, status);
        clazz = getClassForNode(word, patternClazz, nodes, key, status, true);
        let label = status + '\n' +"(" + nodes[key][status].statusArray.length + ")";
        updateComparisonUniqueness(word, comparisonTableData, key, status);
        hasStatus(statusObj, status);
        g.setNode(id, {shape: "response", label : label, class: clazz});
        if(nodes[key][status].outgoingXOR){
          g.setNode("XOR-"+key+' '+status, {label: "X", shape: "outgoing_gateway", class: "type-XOR outgoingXOR"});
        }
      }
    }
  }
  //Set Up Edges
  for(var key in nodes){
    var str = "inXOR-"+key
    var size = Object.keys(nodes[key]).length
    var bin = computeAssignBin(totalAvgKey[key].totalDelayAvgKey, maxDelay, 1);
    if(size == 1){
      var status = Object.keys(nodes[key])[0]
      let clazz = "edge-thickness-" + nodes[key][status].statusArray.length + " " + "delay-coloring-" + bin;
      let id = key+' '+status;
      if(nodes[key][status].outgoingXOR){
        g.setEdge(id,"XOR-"+id, {class: clazz});

      }
      if(nodes[key][status].statusArray.length > 1 && Object.keys(incomingXorNodes[key]).length == 1){
        let space = Object.keys(incomingXorNodes[key])[0]
        let p = getProbabilityLabel(nodes, nodes[key][status].statusArray[0].start.split(' ')[0], nodes[key][status].statusArray[0].start.split(' ')[1], incomingXorNodes[key][space].length);
        g.setEdge(nodes[key][status].statusArray[0].start, key+' '+status, {label: p, class: clazz})

      }
      if(nodes[key][status].statusArray.length == 1){
        let p = getProbabilityLabel(nodes, nodes[key][status].statusArray[0].start.split(' ')[0], nodes[key][status].statusArray[0].start.split(' ')[1], 1);
        g.setEdge(nodes[key][status].statusArray[0].start, key+' '+status, {label : p, class: clazz})

      }
      if(nodes[key][status].statusArray.length > 1 && Object.keys(incomingXorNodes[key]).length > 1){
        g.setEdge("inXOR-"+key, id, {class: clazz})

        for(var space in incomingXorNodes[key]){
          var len = incomingXorNodes[key][space][0].length;
          if(len == 1){
            g.setEdge(incomingXorNodes[key][space][0][0], str,
              {class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-0"})
              comparisonTableData.uniqueOverlapping.uniqueEdges.size++;

            }
            else{
              let avg = getIncomingEdgeIndexDelay(nodes, key, incomingXorNodes[key][space][0][0]+' '+incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
              bin = computeAssignBin(avg, maxDelay, 1);
              let p = getProbabilityLabel(nodes, incomingXorNodes[key][space][0][0], incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
              g.setEdge(incomingXorNodes[key][space][0][0]+' '+incomingXorNodes[key][space][0][1], str,
              { label : p,
                class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-"+bin})
              }
            }
          }
        }
        else{
          var str1 = "middleXOR-"+key;
          let clazz ="edge-thickness-"+totalRequests[key] + " " + "delay-coloring-"+bin;
          if(Object.keys(incomingXorNodes[key]).length > 1){
            g.setEdge(str,key, {
              class: clazz});

            }
            g.setEdge(key,str1, {class: "edge-thickness-"+totalRequests[key] + " " + "delay-coloring-0"});
            for(var status in nodes[key]){
              bin = computeAssignBin(nodes[key][status].avgDelay, maxDelay, 1);
              let p = roundUp(nodes[key][status].statusArray.length/totalRequests[key]*100,1)+"%";
              clazz = "edge-thickness-" +nodes[key][status].statusArray.length + " " + "delay-coloring-"+bin
              let id = key+' '+status;
              g.setEdge(str1, id,{label: p, class: clazz})
              if(nodes[key][status].outgoingXOR){
                g.setEdge(id, "XOR-"+id,
                {class: "edge-thickness-" + nodes[key][status].statusArray.length + " delay-coloring-0"});
              }
            }
            multipleIncomingXorSetUp(g, nodes, key, Object.keys(incomingXorNodes[key]).length, maxDelay, 1, incomingXorNodes)
          }
        }
        //Set Up End Node
        for(var end in endConnections){
          var endConnection = endConnections[end];
          var spaces =  endConnection.split(' ');
          var k = spaces[0]
          var s = spaces[1]
          if(nodes[k][s].outgoingXOR){
            g.setEdge("XOR-"+k+' '+s, "end-"+end, {
              label : roundUp(1/totalRequests[k]*100,1)+"%",
              class: "edge-thickness-1 delay-coloring-0"})
            }
            else{
              g.setEdge(k+' '+s, "end-"+end, {class: "edge-thickness-1 delay-coloring-0"});
            }
          }
          g.nodes().forEach(function(v) {
            var node = g.node(v);
            // console.log(node);
            // console.log(g.nodes())
            // Round the corners of the nodes
            node.rx = node.ry = 10;
          });
        }

var setupShapes = function(render) {

  function makeGateway(scale,woff,hoff=0,translate) {
    return function(parent, bbox, node) {
      var w = bbox.width,
          h = bbox.height,
          points = [
            { x:   w/2, y: -hoff*h },
            { x:   -woff*w,   y: h/2 },
            { x:   w/2, y: h*(1+hoff) },
            { x:   w*(1+woff),   y: h/2 }
          ];
          shapeSvg = parent.insert("polygon", ":first-child")
            .attr("points", points.map(function(d) { return d.x + "," + d.y; }).join(" "))
            .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");
          parent.insert("path", ":first-child")
            .attr("d", "m 0,0 -15.3186,15.5721 -15.6816,-15.2071 -6.8582,7.1056 15.6149,15.1415 -15.2529,15.5052 7.062,6.9471 15.2966,-15.5498 15.6595,15.1852 6.8801,-7.1279 -15.5926,-15.1196 15.2529,-15.5052 -7.0621,-6.9471 z")
            .attr("transform", "translate("+translate+") scale("+scale+")");

          node.intersect = function(point) {
            return dagreD3.intersect.polygon(node, points, point);
          };

          return shapeSvg;
      };
  }

  function makeBox(d_points,corners,split) {
    return function(parent, bbox, node) {
      var w = bbox.width,
          h = bbox.height,
          points = [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h },
            { x: 0, y: h }
          ];
          function cornerToArc(i) {
            if (corners[i]) return " a 10 10 90 0 1 "+corners[i].dx+ " " + corners[i].dy;
            else return "";
          }


          if (split) {

            var shapeSvg = parent.insert("rect", ":first-child")
                  .attr("rx", node.rx)
                  .attr("ry", node.ry)
                  .attr("x", -bbox.width / 2)
                  .attr("y", -bbox.height / 2)
                  .attr("width", bbox.width)
                  .attr("height", bbox.height)
                  .attr("class", "hide");

            node.intersect = function(point) {
              return dagreD3.intersect.rect(node, point);
            };

            split_line = " M 0,"+2*h/5+" ";
            for (let i = 0; i < 2; i++) {
              split_line += " L " + (points[i].x+d_points[i].x) + "," + (points[i].y+d_points[i].y) + cornerToArc(i);
            }
            split_line += " l 0,"+((2*h/5)-10)+" z";

            parent.insert("path", ":first-child")
              .attr("d", split_line)
              .attr("class", "type-Request")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");

            split_line = " M 0,"+2*h/5+" H "+w;
            for (let i = 2; i < points.length; i++) {
              split_line += " L " + (points[i].x+d_points[i].x) + "," + (points[i].y+d_points[i].y) + cornerToArc(i);
            }
            split_line += " z";

            parent.insert("path", ":first-child")
              .attr("d", split_line)
              .attr("class", "type-Response")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");
          } else {

             shapeSvg = parent.insert("path", ":first-child")
              .attr("d", "m 0,10 L " + points.map(function(d,i) { return (d.x+d_points[i].x) + "," + (d.y+d_points[i].y) + cornerToArc(i); }).join("L ") + " z")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");

             node.intersect = function(point) {
                return dagreD3.intersect.polygon(node, points, point);
             };
          }

          return shapeSvg;
      };
  }

  render.shapes().small_gateway = makeGateway(0.4,0.1,0,"6,-9");
  render.shapes().incoming_gateway = makeGateway(0.5,0.3,0.1,"8,-11");
  render.shapes().outgoing_gateway = makeGateway(0.5,0.3,0.1,"8,-11");
  render.shapes().large_gateway = makeGateway(0.5,0.3,0.1,"8,-11");
  render.shapes().request = makeBox([
            { x: 0, y: 10 },
            { x: -10, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
          ],[
            { dx: 10, dy: -10 },
            { dx: 10, dy: 10 }
          ]);
  render.shapes().response = makeBox([
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: -10 },
            { x: 10, y: 0 }
          ],[ 
            { dx: 0, dy: 0 },
            { dx: 0, dy: 0 },
            { dx: -10, dy: 10 },
            { dx: -10, dy: -10 }
          ]);   
  render.shapes().reqresp = makeBox([
            { x: 0, y: 10 },
            { x: -10, y: 0 },
            { x: 0, y: -10 },
            { x: 10, y: 0 }
          ],[ 
            { dx: 10, dy: -10 },
            { dx: 10, dy: 10 },
            { dx: -10, dy: 10 },
            { dx: -10, dy: -10 }
          ],true);                   
}
