

function randomDate(start, end, i, max) {
    var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    var d = new Date(start.getTime() + (i/max) * (d.getTime() - start.getTime()));
	return d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
}

var activities = [['a','b','c'],['a','d','c']];    

var roles = {'a': 'role',
             'b': 'roleb',
             'c': 'rolec',
             'd': 'role'}

var log = [];

for (var i = 0; i < 1000; i++) {

	let as = activities[Math.floor(Math.random() * activities.length)];

	as.forEach((a,j) => {

		log.push({
			date: randomDate(new Date(2012, 0, 1), new Date(), j, as.length),
			case: i,
			activity: a,
			role: roles[a]
		})

	})
}

var text = [];

for (var i = 0; i < log.length; i++) {
	text.push(log[i].date + ", " + log[i].case + ", " + log[i].activity + ", " + log[i].role);
}

console.log(text.join("\n"));

