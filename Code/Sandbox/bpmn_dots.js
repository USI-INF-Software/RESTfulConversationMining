function expandLog_dots(rows){

function expandLog_dots_once(rows,rules){
  let dot_fragments = [];
  let normal_fragments = [];
  let current_fragment = [];
  let target;
  let output_fragments = [];


  // function match_before(joinpoint,current) {
  //   let match_fragments = [];
  //   normal_fragments.forEach(f=>{
  //     f.forEach(r=>{
  //       if (r==joinpoint) {
  //         match_fragments.push(f);
  //       }
  //     })
  //   });
  //   dot_fragments.forEach(f=>{
  //     if (!same(f,current)) {
  //       for(let i = 0; i<f.length; i++) {
  //         if (f[i]==joinpoint && f[i-1] != '...') {
  //           match_fragments.push(f);
  //         }
  //       };
  //     }
  //   });
  //   return match_fragments;
  // }

  // function match_after(joinpoint,current) {
  //   let match_fragments = [];
  //   normal_fragments.forEach(f=>{
  //     f.forEach(r=>{
  //       if (r==joinpoint) {
  //         match_fragments.push(f);
  //       }
  //     })
  //   });
  //   dot_fragments.forEach(f=>{
  //     if (!same(f,current)) {
  //       for(let i = 0; i<f.length; i++) {
  //         if (f[i]==joinpoint && f[i+1] != '...') {
  //           match_fragments.push(f);
  //         }
  //       };
  //     }
  //   });
  //   return match_fragments;
  // }

  // function match2(joinpoint,joinpoint2) {
  //   let match_fragments = [];
  //   normal_fragments.forEach(f=>{
  //     let found = false;
  //     f.forEach(r=>{
  //       if (!found && (r==joinpoint)) {
  //         found = true;
  //       }
  //       if (found && (r==joinpoint2)) {
  //         match_fragments.push(f);
  //       }
  //     })
  //   });
  //   // dot_fragments.forEach(f=>{
  //   //   f.forEach(r=>{
  //   //     if (r==joinpoint) {
  //   //       match_fragments.push(f);
  //   //     }
  //   //   })
  //   // })
  //   return match_fragments;
  // }

  // function exp_middle(joinpoint_before,joinpoint_after,fragment,i){
  //   //look for matching fragments
  //   let match_fragments = match2(joinpoint_before,joinpoint_after,fragment);
  //   match_fragments.forEach(f=>{
  //     let output_fragment = fragment.slice(0,i-1);
  //     var jbfi = f.indexOf(joinpoint_before);
  //     var jafi = f.indexOf(joinpoint_after);
  //     for(let fi = jbfi; fi<jafi; fi++){
  //         output_fragment.push(f[fi]);
  //     }
  //     fragment.slice(i+1).forEach(r=>{
  //       output_fragment.push(r);
  //     })
  //     output_fragments.push(output_fragment);
  //   });
  // }

  // function exp_after(joinpoint,fragment,i){
  //   //look for matching fragments
  //   let match_fragments = match_after(joinpoint,fragment);
  //   match_fragments.forEach(f=>{
  //     let output_fragment = fragment.slice(0,i-1);
  //     var jfi = f.indexOf(joinpoint);
  //     for(let fi = jfi; fi<f.length; fi++){
  //         output_fragment.push(f[fi]);
  //     }
  //     output_fragments.push(output_fragment);
  //   });
  // }

  // function exp_before(joinpoint,fragment,i){
  //   //look for matching fragments
  //   let match_fragments = match_before(joinpoint,fragment);
  //   match_fragments.forEach(f=>{
  //     let output_fragment = [];
  //     var jfi = f.indexOf(joinpoint);
  //     for(let fi = 0; fi<jfi; fi++){
  //         output_fragment.push(f[fi]);
  //     }
  //     fragment.slice(i+1).forEach(r=>{
  //       output_fragment.push(r);
  //     })
  //     output_fragments.push(output_fragment);
  //   });
  // }

  // function scan(frows){

  //   //this becomes the core recursion...
  //   for(let i = 0; i< frows.length; i++) {
  //     if (frows[i] == "...") {
        
  //       if (i+1<frows.length && frows[i+1].length > 0 && i-1>0 && frows[i-1].length > 0) { //something afterwards and before
  //         //expand_middle(rows,i,rows[i+1].trim(),rows[i-1].trim(),expanded_rows);
  //         exp_middle(frows[i-1],frows[i+1],frows,i);
  //       } else
  //       if (i+1<frows.length && frows[i+1].length > 0) { //something afterwards
  //         //i += expand_before(rows,i,rows[i+1].trim(),expanded_rows);
  //         exp_before(frows[i+1],frows,i);
  //       } else { //something after
  //         exp_after(frows[i-1],frows,i);
  //         //expand_after(rows,i-2,rows[i-1].trim(),expanded_rows);
  //       }
  //     } else {
  //       //expanded_rows.push(rows[i].trim());
  //     }
  //   }
  // }

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
  initial_all_fragments = initial_normal_fragments.concat(initial_dot_fragments);

  function make_rules(dot_fragments){
    rules = { after: {}, before: {}, middle: {}, fragments: {} };

    function push(r,o) {
      if (!r[o.key]) {
        r[o.key] = [o];
      } else {
        r[o.key].push(o);
      }
    }

    dot_fragments.forEach((frows)=>{

          //fragments begin and end with ...
          if ((frows[0] == "...") && (frows[frows.length-1] == "...") && (frows.length > 3)) {
            push(rules.fragments, {key: frows[1]+","+frows[frows.length-2], rows:frows, add_middle: frows.slice(2,frows.length-2)});
          }
          // but fragments are also before and after rules
          // else
          for(let i = 0; i< frows.length; i++) {
                if (frows[i] == "...") {
                  
                  if (i+1<frows.length && frows[i+1].length > 0 && i-1>=0 && frows[i-1].length > 0) { //something afterwards and before
                    push(rules.middle, { key: frows[i-1]+","+frows[i+1], 
                                         rows: frows, 
                                         i,
                                         after: frows[i+1], 
                                         add_after: frows.slice(i+2), 
                                         before: frows[i-1], 
                                         add_before: frows.slice(0,i-1)
                                       });
                  } else
                  if (i+1<frows.length && frows[i+1].length > 0) { //something afterwards
                    push(rules.after, {key: frows[i+1], rows: frows, i, after: frows[i+1], add_after: frows.slice(i+2)});
                  } else { //something after
                    push(rules.before, {key: frows[i-1], rows: frows, i, before: frows[i-1], add_before: frows.slice(0,i-1)})
                  }

                } 
          }
    });

    console.log("RULES",JSON.stringify(rules,null,2));
    return rules;

  }

  if (!rules)
    rules = make_rules(initial_dot_fragments);


  function match_after_rules(rules, el, i, nf) {
    var of = [];
    if (rules[el]) {
      rules[el].forEach((r)=>{
        of.push(nf.slice(0,i+1).concat(r.add_after));
      });
    }
    return of;
  }

  function match_before_rules(rules, el, i, nf) {
    var of = [];
    if (rules[el]) {
      rules[el].forEach((r)=>{
        of.push(r.add_before.concat(nf.slice(i)));
      });
    }
    return of;
  }

  function match_middle_rules(rules, el, i, nf) {
    var of = [];
    for(let j = 0; j< nf.length; j++) {
      let key = "";
      if (j < i) {
        key = nf[j]+","+el;
      } else if (j > i) {
        key = el+","+nf[j];
      }

      if (rules[key]) {
        rules[key].forEach((r)=>{
          of.push(r.add_before.concat(nf.slice(Math.min(i,j),Math.max(i,j)+1)).concat(r.add_after));
        });
      }

    }
    return of;
  }

  let expanded_rows = [];
  output_fragments = [];

  initial_normal_fragments.forEach((nf)=>{
    for(let i = 0; i< nf.length; i++) {
      if (nf[i] == "...") {
        //should not happen
      } else {
         output_fragments = output_fragments.concat(match_after_rules(rules.after, nf[i], i, nf))
                                            .concat(match_before_rules(rules.before, nf[i], i, nf))
                                            .concat(match_middle_rules(rules.middle, nf[i], i, nf));
      }  
    }
  });

  //filter dot fragments which are not fragments, they have at least some starting activity or some ending one
  function instanceable(dfs) {
    let idf = [];
    dfs.forEach( (df) => {
      if (df[0] != "..." || df[df.length-1] != "...")
        idf.push(df);
    });
    return idf;
  }

  instanceable(initial_dot_fragments).forEach((nf)=>{
    for(let i = 0; i< nf.length; i++) {
      if (nf[i] == "...") {
        //can happen
      } else {
         output_fragments = output_fragments.concat(match_after_rules(rules.after, nf[i], i, nf))
                                            .concat(match_before_rules(rules.before, nf[i], i, nf))
                                            .concat(match_middle_rules(rules.middle, nf[i], i, nf));
      }  
    }
  });

  //look if there are fragments matching self-contained middle rules
  function match_middle_fragment_rules(rf, rm) {
    var of = [];

    Object.keys(rm).forEach((rmk) => {
      if (rf[rmk]) {
        rf[rmk].forEach((r_rf)=>{
          rm[rmk].forEach((r_rm)=>{
            var o = [].concat(r_rm.add_before);
            o.push(r_rm.before);
            o = o.concat(r_rf.add_middle);
            o.push(r_rm.after);
            o = o.concat(r_rm.add_after);
            of.push(o);
          });
        });
      }
    })
    return of;
  }

  //look if there are matching after/before rules
  function match_after_before_rules(ra, rb) {
    var of = [];

    Object.keys(ra).forEach((rak) => {
      if (rb[rak]) {
        ra[rak].forEach((r_ra)=>{
          rb[rak].forEach((r_rb)=>{
            var o = [].concat(r_rb.add_before);
            o.push(r_rb.before);
            o = o.concat(r_ra.add_after);
            of.push(o);
          });
        });
      }
    })
    return of;
  }

  output_fragments = output_fragments.concat(match_middle_fragment_rules(rules.fragments,rules.middle))
                                     .concat(match_after_before_rules(rules.after,rules.before));

  // console.log(output_fragments);

    function dedup(f) {
      let o = {};
      f.forEach(f=>{o[f.join(",")] = f});
      return Object.values(o);
    }

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

  unique_fragments.forEach(dumpFragment);

  console.log("hasDots",hasDots);
  console.log(expanded_rows.join("\n"));

  return {hasDots, expanded_rows, rules};

  // let hasDots = true;
  // let expanded_rows = [];
  // let iterations = 0;
  // let prev_unique_fragments = [];
  // while (hasDots) {
  //   output_fragments = [];
    
  //   for(let fi = 0; fi< dot_fragments.length; fi++) {
  //     let frows = dot_fragments[fi];
  //     scan(frows);
  //   }

  //   function dedup(f) {
  //     let o = {};
  //     f.forEach(f=>{o[f.join(",")] = f});
  //     return Object.values(o);

  //     // return f1.concat(f2);
  //   }

  //   //output fragments may contain ...
  //   unique_fragments = dedup(normal_fragments.concat(output_fragments));

  //   expanded_rows = [];
  //   hasDots = false;
  //   function dumpFragment(f){
  //     f.forEach(r=>{
  //       expanded_rows.push(r);
  //       if (r === "...") hasDots = true;
  //     });
  //     expanded_rows.push("");
  //   }
  //   // normal_fragments.forEach(dumpFragment);
  //   // output_fragments.forEach(dumpFragment);
  //   unique_fragments.forEach(dumpFragment);

  //   console.log(iterations,expanded_rows.join("\n"));

  //   if (!hasDots) {
  //     return expanded_rows;
  //   } else if (iterations > 10) {
  //       expanded_rows = [];
  //       dedup(normal_fragments).forEach(dumpFragment);
  //       return expanded_rows;
  //   }

  //   normal_fragments = initial_normal_fragments.slice();
  //   dot_fragments = initial_dot_fragments.slice();

  //   cut(expanded_rows);

  //   iterations++;
  // }
  return expanded_rows;
}

  function x_dropdots(drows) {
    let r = [];
    // let new_trace = true;
    let has_dots = false;
    let t = [];
    drows.forEach( (dr) => {
      if (dr == "...") {
        has_dots = true;
      };
      if (dr.length == 0) {
        if (!has_dots){
          r = r.concat(t);
        }
        t = [];
        has_dots = false;
      }
      t.push(dr);
    });
    return r;
  }

  function dropdots(drows) {
    return drows;
  }

  let hasDots = true;
  let inRows = rows;
  let iterations = 0;
  let rules;

  while (hasDots) {
    // let er = expandLog_dots_once(inRows, rules);
    let er = expandLog_dots_once(inRows);

    if (!er.hasDots) {
      return er.expanded_rows;
    }

    if (iterations > 2) {
      console.log("Iteration limit reached (output still contains dots)");
      return x_dropdots(er.expanded_rows);
    }

    inRows = inRows.concat(dropdots(er.expanded_rows));
    rules = er.rules;
    iterations++;
  }

}