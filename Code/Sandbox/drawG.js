var drawG = function(g, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj, bpmnActivities, mstart, mend){

  // console.log(nodes);
  // console.log(endConnections);
  // console.log(incomingXorNodes);

  function mergeStart(n) {
    for(var key in n){
      var size = Object.keys(n[key]).length;
      if(size == 1){
        var status = Object.keys(n[key])[0];
        console.log(n[key][status].statusArray);
        let sa_key;
        let dups = [];
        n[key][status].statusArray.forEach((sa)=>{
          if (sa_key === undefined) {
            sa_key = sa.key;
          } else {
            if (sa_key == sa.key && sa.startId !== 0 && sa.startId.startsWith("start-")) {
              dups.push(sa.arrIndex);
            }
          }
        });
        console.log("dups: ",dups);
        // dups.forEach((d)=>{
        //   delete n[key][status].statusArray[d];
        // });
        // let i = 0;
        // while(i<n[key][status].statusArray.length) {
        //   if (n[key][status].statusArray[i] != undefined) {
        //     i++;
        //   } else {
        //     n[key][status].statusArray.splice(i,1);
        //   }
        // }
        // n[key][status].statusArray.forEach((sa)=>{
        //   sa.start = sa.startId;
        // });
        console.log(n[key][status].statusArray.length);
      } else {
        console.log("size "+size,n[key]);
      }
    }
    return n;
  }

  //nodes = mergeStart(nodes);

  function setParticipant(key, status, id) {
    if (bpmnActivities === undefined)
      return;

    let P = Array.from(bpmnActivities.activities[nodes[key][status].statusArray[0].key.replace("TASK ","")])[0];
    console.log("setParticipant",key+" "+status+" "+id,P);
    if (P !== undefined) {
      g.setParent(id, 'Participant_'+ P);
    }
  }

  for(var key in nodes){
    var size = Object.keys(nodes[key]).length;
    if(size == 1){
      var status = Object.keys(nodes[key])[0];
      var str = "inXOR-"+key
      let word = setUpClassForDifferentIpTp(nodes, key, status);
      updateComparisonUniqueness(word, comparisonTableData, key, status);
      hasStatus(statusObj, status);
      let patternClazz = getPatternClassName(key, status);
      let clazz = getClassForNode(word, patternClazz, nodes, key, status, false) +" totalRequest-"+totalRequests[key];
      if(incomingXorNodes[key] !== undefined) checkIfIncomingXorExists(nodes, key, incomingXorNodes, Object.keys(incomingXorNodes[key]).length, "inXOR-"+key)
      let label = nodes[key][status].statusArray[0].key + '\n \n' + status + '\n' + "(" + nodes[key][status].statusArray.length + ")";
      let id = key+' '+status;
      if (status == 0) {
        label = nodes[key][status].statusArray[0].key.replace("TASK ","").replace(/_/g," ") + '\n' + "(" + nodes[key][status].statusArray.length + ")";
        g.setNode(id, { shape: "bpmn_task",
        label : label,
        class: clazz});
        setParticipant(key,status,id);
      } else {
        g.setNode(id, { shape: "reqresp",
        label : label,
        class: clazz});
      }
      if(nodes[key][status].outgoingXOR){
        g.setNode("XOR-"+id, {label: "X", shape: "large_gateway", class: "type-XOR outgoingXOR"});
        setParticipant(key,status,"XOR-"+id);

      }
      if((nodes[key][status].statusArray.length) > 1 && Object.keys(incomingXorNodes[key]).length > 1){
        var str = "inXOR-"+key
        g.setNode(str, {label: "X", shape: "large_gateway", class: "type-XOR incomingXOR"});
        setParticipant(key,status,"inXOR-"+key);
      }
    }
    else{ //this does not happen in BPMN
      var st = Object.keys(nodes[key])[0]
      var word = setUpTotalClassForDifferentIpTp(nodes, key);
      let patternClazz = getPatternClassName(key, undefined);
      updateComparisonUniqueness(word, comparisonTableData, key, undefined);
      let clazz = getClassForNode(word, patternClazz, nodes, key, "", false) +" totalRequest-"+totalRequests[key];
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
        clazz = getClassForNode(word, patternClazz, nodes, key, status, true) +" totalRequest-"+nodes[key][status].statusArray.length;
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
  //Set Up Participants
  if (bpmnActivities !== undefined) {
    for(p in bpmnActivities.participants) {
      g.setNode("Participant_"+bpmnActivities.participants[p], {label: bpmnActivities.participants[p], clusterLabelPos: 'top', style: 'stroke: black; fill: white; stroke-dasharray: 1 0 1;'});
      console.log("Participant_"+bpmnActivities.participants[p]);
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
          setParticipant(k,s,"end-"+end);
          setParticipant(k,s,"start-"+end);
          console.log("start-"+end);

//          g.setEdge(k+' '+s, "end-"+end, {class: "edge-thickness-1 delay-coloring-0"});


          if(nodes[k][s].outgoingXOR){
              g.setEdge("XOR-"+k+' '+s, "end-"+end, {
                label : roundUp(1/totalRequests[k]*100,1)+"%",
                class: "edge-thickness-1 delay-coloring-0"})
            }
            else{
              g.setEdge(k+' '+s, "end-"+end, {class: "edge-thickness-1 delay-coloring-0"});

            }

          }

          function mergeXOR(g_sources,f_successors,f_predecessors,prefix,f_connect,xor_prefix,style) {

          function groupBy(xs, kf) {
            return xs.reduce(function(rv, x) {
              (rv[kf(x)] = rv[kf(x)] || []).push(x);
              return rv;
            }, {});
          };

          let gg = groupBy(g_sources.filter((v)=>{
            var node = g.node(v);
            if (node.shape == "circle") {
              let x = f_successors(v).filter(n=>{
                console.log(n);
                return n.startsWith(xor_prefix);
              });
              return (x.length > 0);
            }
            return false;
          }), (v)=>{
            let s = f_successors(v);
            return s.join(",");
          });

          console.log("GroupBY",gg);

          Object.keys(gg).forEach(function(ggk) {
            let rem = [];
            let start_targets = [];
            let clients = [];
            gg[ggk].forEach((v)=>{
              var node = g.node(v);
              if (node.shape == "circle") {
                console.log(node);
                clients.push(node.label);
                let x = f_successors(v).filter(n=>{
                  return n.startsWith(xor_prefix);
                });
                if (x.length > 0) {
                  rem.push(v);
                }

                x.forEach((n)=>{
                  let before_x = f_predecessors(n);
                  let all_start = true;
                  before_x.forEach((bx)=>{
                    var bx_node = g.node(bx);
                    if (bx_node.shape != "circle") {
                      all_start = false;
                    }
                  })
                  if (all_start) {
                    rem.push(n);
                    start_targets.push(f_successors(n));
                  } else {
                    start_targets.push(n);
                  }
                });
              }

            });
            rem.forEach((n)=>{g.removeNode(n); console.log("Removing "+n)});

            g.setNode(prefix+clients.join(","), {shape: "circle", class : "start" + " tpIpColoring-"+clients.join(","), label: clients.join(","), style});
            start_targets.forEach((st)=>{
              f_connect(prefix+clients.join(","), st);
              g.setParent(prefix+clients.join(","),g.parent(st));
            });
          });

          //

          // g.sinks().forEach(function(v) {
          //   var node = g.node(v);
          //   if (node.shape == "circle") {
          //     console.log(node);
          //     console.log(g.predecessors(v));
          //     console.log(g.predecessors(g.predecessors(v)));
          //   }

          //   // console.log(g.nodes())
          //   // Round the corners of the nodes
          //   //node.rx = node.ry = 10;
          // });

          }//mergeStartXOR
          if (mstart) {
            mergeXOR(g.sources(),g.successors.bind(g),g.predecessors.bind(g),"start-",(s,d)=>{g.setEdge(s,d)},"inXOR-");
          }
          if (mend) {
            mergeXOR(g.sinks(),g.predecessors.bind(g),g.successors.bind(g),"end-",(s,d)=>{g.setEdge(d,s)},"XOR-","stroke-width: 4; stroke: black");
          }

          let senders = g.nodes().filter((n)=>{return g.node(n).label.toLowerCase().startsWith("send");});
          let receivers = g.nodes().filter((n)=>{return g.node(n).label.toLowerCase().startsWith("receive");});

          function parseSharedMessage(s) {
            return s.split("\n")[0].toLowerCase().replace("send","").replace("receive","").trim();
          }

          senders.forEach((source)=>{
            let msg = parseSharedMessage(g.node(source).label);
            console.log(msg);
            let targets = receivers.filter((n)=>{return parseSharedMessage(g.node(n).label) == msg});
            console.log(targets);
            if (targets.length>0) {
              //just connect to the first //minlen cannot be set to 0
              g.setEdge(source, targets[0], { minlen: 1, arrowhead: "messageFlow", style: 'stroke: #888; fill: none; stroke-dasharray: 4 0 4' });
            }
          })

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
            try {
              return dagreD3.intersect.polygon(node, points, point);
            } catch (e) {
              console.log(node,points,point);
              console.log(e);
              return {x:0,y:0}
            }
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

            parent.insert("path", ":last-child")
              .attr("d", split_line)
              .attr("class", "type-Request")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");

            split_line = " M 0,"+2*h/5+" H "+w;
            for (let i = 2; i < points.length; i++) {
              split_line += " L " + (points[i].x+d_points[i].x) + "," + (points[i].y+d_points[i].y) + cornerToArc(i);
            }
            split_line += " z";

            parent.insert("path", ":last-child")
              .attr("d", split_line)
              .attr("class", "type-Response")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");
          } else {

             shapeSvg = parent.insert("path", ":first-child")
              .attr("d", "m 0,10 L " + points.map(function(d,i) { return (d.x+d_points[i].x) + "," + (d.y+d_points[i].y) + cornerToArc(i); }).join("L ") + " z")
              .attr("transform", "translate(" + (-w/2) + "," + (-(h/2)) + ")");

             node.intersect = function(point) {
                //return dagreD3.intersect.polygon(node, points, point);
                try {
                  return dagreD3.intersect.polygon(node, points, point);
                } catch (e) {
                  console.log(node,points,point);
                  console.log(e);
                  return {x:0,y:0}
                }
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
  render.shapes().bpmn_task = makeBox([
            { x: 0, y: 10 },
            { x: -10, y: 0 },
            { x: 0, y: -10 },
            { x: 10, y: 0 }
          ],[
            { dx: 10, dy: -10 },
            { dx: 10, dy: 10 },
            { dx: -10, dy: 10 },
            { dx: -10, dy: -10 }
          ]);
  render.shapes().swimlane = makeBox([
            { x: 0, y: 100 },
            { x: -100, y: 0 },
            { x: 0, y: -100 },
            { x: 100, y: 0 }
          ],[
            { dx: 100, dy: -100 },
            { dx: 100, dy: 100 },
            { dx: -100, dy: 100 },
            { dx: -100, dy: -100 }
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
  render.arrows().messageFlow = function normal(parent, id, edge, type) {
          var marker = parent.append("marker")
            .attr("id", id)
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 9)
            .attr("refY", 5)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 8)
            .attr("markerHeight", 6)
            .attr("orient", "auto");

          var path = marker.append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .style("stroke-width", 1)
            .style("stroke-dasharray", "1,0")
            .style("fill", "#fff")
            .style("stroke", "#888");
          dagreD3.util.applyStyle(path, edge[type + "Style"]);

          var marker = parent.append("marker")
            .attr("id", id+"-0")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)
            .attr("refY", 5)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto");

          var path = marker.append("path")
            .attr("d", "M 5,5 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0")
            .style("stroke-width", 1)
            .style("stroke-dasharray", "1,0")
            .style("fill", "#fff")
            .style("stroke", "#888");
          dagreD3.util.applyStyle(path, edge[type + "Style"]);

          //hack to inject the marker-start attribute
          let path_dom = parent.node().parentNode.querySelector("path.path");
          path_dom.setAttribute("marker-start",path_dom.getAttribute("marker-end").replace("#"+id,"#"+id+"-0"));

        };

}
