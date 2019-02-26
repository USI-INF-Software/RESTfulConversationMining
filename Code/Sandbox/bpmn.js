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

var bpmnParser = function(links){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      console.log(spaces);
      let task = spaces.splice(3).join("_");
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : "TASK", location: task, status : 0}
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

var links = text.split("\n");

var parseRouteData, sequentialParser, flatParser;
if(routes !== undefined) parseRouteData = createData(links, routes, readParseURLRouteFile);
sequentialParser = createData(links, undefined, readParseFile);
flatParser = createData(links, undefined, flatProcessingOfFile);
bpmnParserData = createData(links, undefined, bpmnParser);
console.log(bpmnParserData);
var data = {};
// data.IgnoreURIs = flatParser;
// data.FullURIs = sequentialParser;
// data.TemplateURIs = parseRouteData;
data.bpmnActivites = bpmnParserData;

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


function live(text,auto) {
  delay(()=>{
    var data;
    var rows = text.split("\n");

    var expanded_rows = [];
    for(let i = 0; i< rows.length; i++) {
      if (rows[i].trim() == "...") {
        
        if (i+1<rows.length && rows[i+1].length > 0 && i-1>0 && rows[i-1].length > 0) { //something afterwards and before
          expand_middle(rows,i,rows[i+1].trim(),rows[i-1].trim(),expanded_rows);
        } else
        if (i+1<rows.length && rows[i+1].length > 0) { //something afterwards
          i += expand_before(rows,i,rows[i+1].trim(),expanded_rows);
        } else {
          expand_after(rows,i-2,rows[i-1].trim(),expanded_rows);
        }
      } else {
        expanded_rows.push(rows[i].trim());
      }
    };

    console.log("Expanded ... log:");
    console.log(expanded_rows);
    console.log(expanded_rows.join("\n"));

    var client_id = 0;
      var client_rows = [];
      expanded_rows.forEach(r => {
        if (r.trim().length == 0) {
          client_id++;
        } else {
          client_rows.push("C" + client_id + " " + r);
        }
      })

    timed_rows = client_rows.map((l,i) => { return i + " " + i + " " + l }); //.reverse();
    data = localParser(timed_rows.join("\n"));

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
    drawGraph(ret2);  
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