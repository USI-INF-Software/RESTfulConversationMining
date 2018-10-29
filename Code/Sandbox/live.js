function localParser(text) {

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

      routes.forEach(function(r) {
        if (r.match(url)) {
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
//if(routes !== undefined) parseRouteData = createData(links, routes, readParseURLRouteFile);
sequentialParser = createData(links, undefined, readParseFile);
flatParser = createData(links, undefined, flatProcessingOfFile);
// console.log(parseRouteData);
var data = {};
data.IgnoreURIs = flatParser;
data.FullURIs = parseRouteData;
data.TemplateURIs = sequentialParser;

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

function live(text,auto) {
  delay(()=>{
    var data = localParser(text);
    console.log(data);
    clients = data.TemplateURIs; //TODO switch
    displayClients();

    if (!auto) return;

    var ret2 = [];
    Object.keys(clients).forEach((e)=>{ret2.push(clients[e])}); //select all clients
    drawGraph(ret2);  
  });
}