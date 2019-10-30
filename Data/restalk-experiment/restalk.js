function makeDelay(ms,callback) {
    var timer;
    return function(e){
        if (timer) clearTimeout(timer);
        timer = setTimeout(()=>{callback(e)}, ms);
    };
};


function init(){


  //zoom
  document.querySelectorAll("a").forEach((e)=>{e.setAttribute("target","_blank")});
  let svg = d3.select("svg");
  let zoom = d3.zoom().on("zoom", ()=>{
    //console.log(d3.event.transform);
    //document.querySelector("svg").style.transform = d3.event.transform;
    d3.select("svg > g").attr("transform", d3.event.transform);
  });
  svg.call(zoom);
  let dx = window.innerWidth/2 + 100;
  let dy = window.innerHeight/2 - 200;
  let initialScale = Math.min(window.innerWidth/document.querySelector("svg").getAttribute("width"), window.innerHeight/document.querySelector("svg").getAttribute("height"));
  console.log(svg.width,dx,dy,initialScale);
  svg.call(zoom.transform, d3.zoomIdentity.translate(dx,dy).scale(initialScale));

  function amouseover(e) {
    console.log(e.target);
    let n = e.target.parentNode;
    while (n.tagName != "a") {
      n = n.parentNode;
    }
    console.log(n.querySelector("title"));
  }

  document.querySelectorAll("a").forEach((a)=>{
    a.addEventListener("mouseover", amouseover);
  })

  function setTooltip(n) {
    let title = n.querySelector("title");
    if (title) {
      let title_txt = title.innerHTML;
      //this is really brittle as it assumes that the a element always follows the path
      //on the same level in the svg
      let a_txt = n.nextElementSibling.querySelector("tspan").textContent;

      let a = title_txt.split(" ");

      let first = a.shift();

      let t = document.querySelector("#title");
      t.innerHTML = "<code>" + a_txt + "</code>"+ first + " <span style='color:black'>" + a.join(" ") + "</span>";
      t.style.color = n.style.fill;
    }
  }

  function pathmouseover(e) {
    let n = e.target;
    console.log(e.target.style.fill);
    n.style.opacity = 0.5;

    setTooltip(n);
  }

  function pathmouseout(e) {
    let n = e.target;
    n.style.opacity = 0.9;

    setTooltip(n);
  }

  document.querySelectorAll("path").forEach((a)=>{
    a.addEventListener("mouseover", makeDelay(250,pathmouseover));
    a.addEventListener("mouseout", makeDelay(250,pathmouseout));
  });

  function lookup(id) {
    let result = [];
    if (hyperflow_lookup[id]) {
      result = result.concat(hyperflow_lookup[id]);
    }
    Object.keys(hyperflow_lookup).forEach((k)=>
    {
      if (hyperflow_lookup[k].indexOf(id) >= 0) {
        result.push(k);
      }
    })
    return result;
  }

  function rectmouseover(e) {
    let n = e.target;
    console.log(n.id);
    n.style.fillOpacity = 0.5;
    n.style.fill = "yellow";
    n.style.strokeDasharray = "1px";

    //comment out for production
    //document.querySelector("#title").innerHTML = n.id;

    highlight(lookup(n.id), highlight_one);
  }

  function highlight(ids,c){
    if (ids) {
      ids.forEach(c)
    }
  }

  function highlight_one(id){
    let n = document.getElementById(id);
    n.style.fill = "red";
    n.style.fillOpacity = 0.5;
  }

  function un_highlight_one(id){
    let n = document.getElementById(id);
    n.style.fill = "white";
    n.style.fillOpacity = 0.25;
  }

  function rectmouseout(e) {
    let n = e.target;
    n.style.fill = "white";
    n.style.fillOpacity = 0.25;
    n.style.strokeDasharray = "4px 12px";
    highlight(lookup(n.id), un_highlight_one);
  }

  let ids = [];

  function rectmouseclick(e) {
    let n = e.target;
    ids.push(n.id);

    let txt = '"' + ids[0] + '" : [' + ids.slice(1).map((i)=>`"${i}"`).join(", ")+"],";
    console.log(txt);

    document.querySelector('#ids code').innerHTML = txt;
  }

  document.querySelectorAll("rect").forEach((a)=>{
    a.addEventListener("mouseover", rectmouseover);
    a.addEventListener("mouseout", rectmouseout);
    //comment out for production
    //a.addEventListener("click", rectmouseclick);
    a.style.fill = "white";
    a.style.fillOpacity = 0.2;
  });

  let div = document.createElement("div");
  document.body.appendChild(div);
  div.innerHTML = "<p id='title' style='padding: 1em; position: fixed; top: 0; left: 1em'></p><p id='ids'><code></code> <sup id='clear'>X</sup></p>";

  document.querySelector("#clear").addEventListener("click",(e)=>{
    document.querySelector('#ids code').innerHTML = "";
    ids = "";
  })

}

