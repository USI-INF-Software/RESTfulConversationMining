function localParser(text,routes) {

//Read the file and parse it to objects
var readParseFile = function(links){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: spaces[4], status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

//Read the file and parse it to objects
//assumes there are routes passed as second parameter
var readParseURLRouteFile = function(links, routes){

  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      var url = spaces[4];

      console.log(routes,url);
      routes.forEach(function(r) {
        if (r.match(url)) {
          console.log(r.spec);
          url = r.spec;
          //remove : character which will interfere later with the way urls are indexed
          url=url.replace(/\:/g,'');
        }
      })

      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: url, status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

var flatProcessingOfFile = function(links){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: "/", status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

var bpmnParser = function(links,participants){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      let task = spaces.splice(3).join("_");
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : "TASK", location: task, status : 0, participant: participants[task]}
      logs.push(obj);
    }
  }
  return logs;
}

//Bug: the logs may contain some undefined entries. Fixed the bug with undefined it was due to an empty line. --Fixed

//Client segmentation.
var clientSegmentation = function(logs){
  var clients = {}
  for(let i = 0; i < logs.length; i++){
    var ip = logs[i].ip;
    if(clients[ip] === undefined) {
      clients[ip] = [];
    }
    clients[ip].push(logs[i]);
  }
  return clients;
}

//Sort Each Client by time/date.
var compare = function(a,b) {
  if(a > b) return 1
  else if (a === b) return 0
  else return -1
}
var sortClientByDateTime = function(clients){
  for(var ip in clients){
    if(ip !== undefined){
      for(let i = 0; i < clients[ip].length; i++){
        let build1 = clients[ip][i].date.split('/')
        let build2 = clients[ip][i].time.split(':')
        let date = new Date();
        date.setDate(build1[0])
        date.setMonth(build1[1]-1)
        date.setFullYear(build1[2])
        date.setHours(build2[0])
        date.setMinutes(build2[1])
        date.setSeconds(build2[2])
        date.setMilliseconds(0);
        clients[ip][i].datetime = date;
      }
    }
  }
  for(var ip in clients){
    clients[ip].sort((a,b) => compare(a.datetime,b.datetime));
  }
  return clients;
}


// var links, routes;
// var argv = process.argv;
// if(argv[2] === undefined) links = fs.readFileSync("./log2.txt", "ucs2").split('\n');
// else links = fs.readFileSync(argv[2], "utf8").split('\n')
// if(argv[3] != undefined){
//  routes = fs.readFileSync(argv[3], "utf8").split('\n');
// }
// var createRoutes = function(routes){
// var r = [];
// for(let i = 0; i < routes.length; i++){
//   r.push(new Route(routes[i]));
// }
// return r;
// }
// if(routes !== undefined) routes = createRoutes(routes);


// var links = fs.readFileSync("../../Data/log.txt", "utf8").split('\n')
// var links = fs.readFileSync("./log2.txt", "ucs2").split('\n');
// var links = fs.readFileSync("./demoLog.txt", 'utf8').split('\n')

//TODO parse a text file with one route per line and create Route objects and push them into the routes array
// var routes = [];
// routes.push(new Route('/content/abstract/scopus_id/:id'));
// routes.push(new Route('/content/serial/title/issn/:id'));
// routes.push(new Route('/content/author/author_id/:id'));

var createData = function(links, routes, fx){
  var logs;
  if(routes !== undefined){
    logs = fx(links, routes);
  }
  else{
    logs = fx(links);
  }
  var clients = clientSegmentation(logs);
  clients = sortClientByDateTime(clients);
  // console.log(clients);
  return clients;
}

var getParticipants = function(clients) {
  var a_p = {};
  var p = new Set();
  for(var ip in clients) {
    for(var a in clients[ip]) {
      var o = clients[ip][a];
      p.add(o.participant);
      if (a_p[o.location] === undefined) {
        a_p[o.location] = new Set([o.participant]);
      } else {
        a_p[o.location].add(o.participant);
      }
    }
  }
  return {activities: a_p, participants: Array.from(p)};
}

var links = text.split("\n");

var parseRouteData, sequentialParser, flatParser;
//if(routes !== undefined) parseRouteData = createData(links, routes, readParseURLRouteFile);
//sequentialParser = createData(links, undefined, readParseFile);
//flatParser = createData(links, undefined, flatProcessingOfFile);
bpmnParserData = createData(links, routes, bpmnParser); //routes used as participants
console.log(bpmnParserData);
var data = {};
// data.IgnoreURIs = flatParser;
// data.FullURIs = sequentialParser;
// data.TemplateURIs = parseRouteData;
data.bpmnActivites = getParticipants(bpmnParserData);

data.FullURIs = bpmnParserData;

return data;

}

function makeDelay(ms) {
    var timer;
    return function(callback){
        if (timer) clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
};

var delay = makeDelay(500);

function addClientID(id, rows) {
  return rows.map((l,i) => { return "C" + id + " " + l });
}

function addTimestamps(rows) {
  return 
}

function expand_after(rows,i,join_point, expanded_rows)
{
  console.log("expand_after "+join_point);
  for(let j = 0; j < i; j++) {
    if(rows[j].trim() == join_point) {
      let k = j+1;
      while (k<rows.length && rows[k].trim().length > 0) {
        expanded_rows.push(rows[k].trim());
        k++;
      }
    }
  }
}

function expand_before(rows,i,join_point, expanded_rows)
{
  let log_start = 0;
  let skip = 1;
  for(let j = 0; j < i; j++) {
    if(rows[j].trim().length == 0) {
      log_start = j;
    }
    if(rows[j].trim() == join_point) {
      for(let k = log_start; k<j; k++) {
        //add before
        expanded_rows.push(rows[k].trim());
      }
      let k = i+1;
      while (k<rows.length && rows[k].trim().length > 0)
      {
        expanded_rows.push(rows[k].trim());
        k++;
      }
      skip = k-i;
    }
  }
  return skip;
}

function expand_middle(rows,i,end_join_point, start_join_point, expanded_rows)
{
  let log_start = 0;
  for(let j = 0; j < i; j++) {
    if(rows[j].trim() == start_join_point) {
      log_start = j+1;
    }
    if(rows[j].trim() == end_join_point) {
      for(let k = log_start; k<j; k++) {
        //add before
        expanded_rows.push(rows[k].trim());
      }
    }
  }
}


function filterCutParticipant(rows){
  let p = "?";
  let a_p = {};
  var output_rows = [];
  for(let i = 0; i< rows.length; i++) {
    var r = rows[i].trim();
    var ra = r.split(" ");
    if (ra[0] == "participant") {
      p = ra[1];
    } else {
      if (p == "?") {
        output_rows.push(r);
      } else
      if (r !== "...") {
        let rkey = r.replace(/ /g,"_");
        if (a_p[rkey] === undefined)
          a_p[rkey] = p;
        // if (a_p[r] === undefined) {
        //   a_p[r] = new Set([p]);
        // } else {
        //   a_p[r].add(p);
        // }
      }
    };
  }
  console.log(a_p);
  return {rows: output_rows, a_p};
}

function filterParticipant(rows){
  let p = "?";
  let a_p = {};
  var output_rows = [];
  for(let i = 0; i< rows.length; i++) {
    var r = rows[i].trim();
    var ra = r.split(" ");
    if (ra[0] == "participant") {
      p = ra[1];
    } else {
      output_rows.push(r);
      if (r !== "...") {
        let rkey = r.replace(/ /g,"_");
        if (a_p[rkey] === undefined)
          a_p[rkey] = p;
        // if (a_p[r] === undefined) {
        //   a_p[r] = new Set([p]);
        // } else {
        //   a_p[r].add(p);
        // }
      }
    };
  }
  console.log(a_p);
  return {rows: output_rows, a_p};
}

function same(f1,f2){
  return (f1.join("\n") == f2.join("\n"));
}

function expandLog(rows){
  let dot_fragments = [];
  let normal_fragments = [];
  let current_fragment = [];
  let target;
  let output_fragments = [];


  function match_before(joinpoint,current) {
    let match_fragments = [];
    normal_fragments.forEach(f=>{
      f.forEach(r=>{
        if (r==joinpoint) {
          match_fragments.push(f);
        }
      })
    });
    dot_fragments.forEach(f=>{
      if (!same(f,current)) {
        for(let i = 0; i<f.length; i++) {
          if (f[i]==joinpoint && f[i-1] != '...') {
            match_fragments.push(f);
          }
        };
      }
    });
    return match_fragments;
  }

  function match_after(joinpoint,current) {
    let match_fragments = [];
    normal_fragments.forEach(f=>{
      f.forEach(r=>{
        if (r==joinpoint) {
          match_fragments.push(f);
        }
      })
    });
    dot_fragments.forEach(f=>{
      if (!same(f,current)) {
        for(let i = 0; i<f.length; i++) {
          if (f[i]==joinpoint && f[i+1] != '...') {
            match_fragments.push(f);
          }
        };
      }
    });
    return match_fragments;
  }

  function match2(joinpoint,joinpoint2) {
    let match_fragments = [];
    normal_fragments.forEach(f=>{
      let found = false;
      f.forEach(r=>{
        if (!found && (r==joinpoint)) {
          found = true;
        }
        if (found && (r==joinpoint2)) {
          match_fragments.push(f);
        }
      })
    });
    // dot_fragments.forEach(f=>{
    //   f.forEach(r=>{
    //     if (r==joinpoint) {
    //       match_fragments.push(f);
    //     }
    //   })
    // })
    return match_fragments;
  }

  function exp_middle(joinpoint_before,joinpoint_after,fragment,i){
    //look for matching fragments
    let match_fragments = match2(joinpoint_before,joinpoint_after,fragment);
    match_fragments.forEach(f=>{
      let output_fragment = fragment.slice(0,i-1);
      var jbfi = f.indexOf(joinpoint_before);
      var jafi = f.indexOf(joinpoint_after);
      for(let fi = jbfi; fi<jafi; fi++){
          output_fragment.push(f[fi]);
      }
      fragment.slice(i+1).forEach(r=>{
        output_fragment.push(r);
      })
      output_fragments.push(output_fragment);
    });
  }

  function exp_after(joinpoint,fragment,i){
    //look for matching fragments
    let match_fragments = match_after(joinpoint,fragment);
    match_fragments.forEach(f=>{
      let output_fragment = fragment.slice(0,i-1);
      var jfi = f.indexOf(joinpoint);
      for(let fi = jfi; fi<f.length; fi++){
          output_fragment.push(f[fi]);
      }
      output_fragments.push(output_fragment);
    });
  }

  function exp_before(joinpoint,fragment,i){
    //look for matching fragments
    let match_fragments = match_before(joinpoint,fragment);
    match_fragments.forEach(f=>{
      let output_fragment = [];
      var jfi = f.indexOf(joinpoint);
      for(let fi = 0; fi<jfi; fi++){
          output_fragment.push(f[fi]);
      }
      fragment.slice(i+1).forEach(r=>{
        output_fragment.push(r);
      })
      output_fragments.push(output_fragment);
    });
  }

  function scan(frows){

    //this becomes the core recursion...
    for(let i = 0; i< frows.length; i++) {
      if (frows[i] == "...") {
        
        if (i+1<frows.length && frows[i+1].length > 0 && i-1>0 && frows[i-1].length > 0) { //something afterwards and before
          //expand_middle(rows,i,rows[i+1].trim(),rows[i-1].trim(),expanded_rows);
          exp_middle(frows[i-1],frows[i+1],frows,i);
        } else
        if (i+1<frows.length && frows[i+1].length > 0) { //something afterwards
          //i += expand_before(rows,i,rows[i+1].trim(),expanded_rows);
          exp_before(frows[i+1],frows,i);
        } else { //something after
          exp_after(frows[i-1],frows,i);
          //expand_after(rows,i-2,rows[i-1].trim(),expanded_rows);
        }
      } else {
        //expanded_rows.push(rows[i].trim());
      }
    }
  }

  function cut(rows){
  //cut the log into fragments
    target = normal_fragments;
    for(let i = 0; i< rows.length; i++) {
      var r = rows[i].trim();
      if (r.length > 0) {
        current_fragment.push(r);
        if (r == "...") {
          target = dot_fragments;
        }
      } else {
        target.push(current_fragment);
        current_fragment = [];
        target = normal_fragments;
      }
    }
  }

  cut(rows);

  initial_normal_fragments = normal_fragments.slice();
  initial_dot_fragments = dot_fragments.slice();

  let hasDots = true;
  let expanded_rows = [];
  let iterations = 0;
  let prev_unique_fragments = [];
  while (hasDots) {
    output_fragments = [];
    
    for(let fi = 0; fi< dot_fragments.length; fi++) {
      let frows = dot_fragments[fi];
      scan(frows);
    }

    function dedup(f) {
      let o = {};
      f.forEach(f=>{o[f.join(",")] = f});
      return Object.values(o);

      // return f1.concat(f2);
    }

    //output fragments may contain ...
    unique_fragments = dedup(normal_fragments.concat(output_fragments));

    expanded_rows = [];
    hasDots = false;
    function dumpFragment(f){
      f.forEach(r=>{
        expanded_rows.push(r);
        if (r === "...") hasDots = true;
      });
      expanded_rows.push("");
    }
    // normal_fragments.forEach(dumpFragment);
    // output_fragments.forEach(dumpFragment);
    unique_fragments.forEach(dumpFragment);

    console.log(iterations,expanded_rows.join("\n"));

    if (!hasDots) {
      return expanded_rows;
    } else if (iterations > 10) {
        expanded_rows = [];
        dedup(normal_fragments).forEach(dumpFragment);
        return expanded_rows;
    }

    normal_fragments = initial_normal_fragments.slice();
    dot_fragments = initial_dot_fragments.slice();

    cut(expanded_rows);

    iterations++;
  }
  return expanded_rows;
}

function live(text,auto) {
  delay(()=>{
    var data;
    var rows = text.split("\n");

    var p_rows = filterParticipant(rows);

    rows = p_rows.rows;

    // expanded_rows = expandLog(p_rows.rows);

    expanded_rows = expandLog_dots(rows);

    console.log("Expanded ... log:");
    console.log(expanded_rows);
    console.log(expanded_rows.join("\n"));
    document.getElementById("explog").value = expanded_rows.join("\n");

    var client_id = 0;
      var client_rows = [];
      expanded_rows.forEach(r => {
        if (r.trim().length == 0) {
          client_id++;
        } else {
          client_rows.push("C" + client_id + " " + r);
        }
      })

    var nextDate = function(d){
      let date = d;
      return function() {
        date.setDate(date.getDate() + 1);
        return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
      }
    };
    nextDate = nextDate(new Date())

    timed_rows = client_rows.map((l,i) => { return nextDate() + " 12:00:00 " + l }); //.reverse();
    data = localParser(timed_rows.join("\n"), p_rows.a_p);

    console.log(data);

    var select = document.getElementById('miningType');
    var kind = select.options[select.options.selectedIndex].id;
    console.log(kind);
    if (kind == "full-url") {
      clients = data.FullURIs; //TODO switch
    } else if (kind == "no-url") {
      clients = data.IgnoreURIs;
    } else if (kind == "template-url") {
      clients = data.TemplateURIs;
    } else {
      console.log("Unknown mining kind: "+kind);
    }
    displayClients();

    if (!auto) return;

    var ret2 = [];
    Object.keys(clients).forEach((e)=>{ret2.push(clients[e])}); //select all clients
    drawGraph(ret2,data.bpmnActivites);  
  });
}

function miningTypeChanged(select) {
  live(document.getElementById('logtext').value, document.getElementById('autolive').checked)

  var kind = select.options[select.options.selectedIndex].id;
  if (kind == "template-url") {
    document.getElementById("div-url-templates").style.display = "block"; 
  } else {
    document.getElementById("div-url-templates").style.display = "none"; 
  }
}