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
    let title_txt = n.querySelector("title").innerHTML;

    let a = title_txt.split(" ");

    let first = a.shift();

    let t = document.querySelector("#title");
    t.innerHTML = first + " <span style='color:black'>" + a.join(" ") + "</span>";
    t.style.color = n.style.fill;
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
    a.addEventListener("mouseover", pathmouseover);
    a.addEventListener("mouseout", pathmouseout);
  });

  let div = document.createElement("div");
  document.body.appendChild(div);
  div.innerHTML = "<p id='title' style='padding: 1em; position: fixed; top: 0; left: 1em'></p>";



}

