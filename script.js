let pixelParliament = {};
pixelParliament.c = {};

$(document).ready(e => {
	//Begin making requests to the API
	ii(0, []);
	//Colour codes corresponding to each party
	pixelParliament.c["Speaker"] = "#FFFFFF";
	pixelParliament.c["Conservative"] = "#00AEEF";
	pixelParliament.c["Labour"] = "#E4003B";
	pixelParliament.c["Liberal Democrat"] = "#FAA61A";
	pixelParliament.c["Sinn Féin"] = "#2B5A45";
	pixelParliament.c["Scottish National Party"] = "#FDF38E";
	pixelParliament.c["The Independent Group for Change"] = "#222221";
	pixelParliament.c["Labour (Co-op)"] = "#3F1D70";
	pixelParliament.c["Ulster Unionist Party"] = "#1E3461";
	pixelParliament.c["United Ulster Unionist Party"] = "#1E3461";
	pixelParliament.c["Ulster Popular Unionist Party"] = "#1E3461";
	pixelParliament.c["Social Democratic Party"] = "#D25469";
	pixelParliament.c["Plaid Cymru"] = "#4F7B2E";
	pixelParliament.c["Green Party"] = "#6AB023";
	pixelParliament.c["Liberal"] = "#ED7A3B";
	pixelParliament.c["Democratic Unionist Party"] = "#C8292B";
	pixelParliament.c["UK Independence Party"] = "#470A65";
	pixelParliament.c["Social Democratic & Labour Party"] = "#2FCD30";
	pixelParliament.c["Alliance"] = "#F4C72E";
});

//Gather data from API (limited to 500 members per page so recursive)
ii = (page, members) => {
	$.ajax({
		type: "GET",
		url: "https://lda.data.parliament.uk/commonsmembers.json?_pageSize=500&_page=" + page,
		dataType: "jsonp",
		success: function (xml) {
			members = members.concat(xml.result.items);
			if (xml.result.next !== undefined) {
				ii(page + 1, members);
			} else {
				i(members);
			}
		},
	});
};

//Parse and display data gathered
i = (raw) => {
	pixelParliament.m = [];
	for (let rawm of raw) {
		let name = rawm.fullName["_value"];
		let party = rawm.party["_value"];
		let colour = (pixelParliament.c[party] === undefined) ? "#777777" : pixelParliament.c[party];
		let constit = (rawm.constituency === undefined) ? "" : rawm.constituency.label["_value"];
		let site = (rawm.homePage === undefined) ? "null" : rawm.homePage;
		let twitter = (rawm.twitter === undefined) ? "null" : rawm.twitter["_value"];
		//Append member to array of people
		pixelParliament.m.push([name, party, colour, constit, site, twitter]);
	}
	//Randomly sort the array
	pixelParliament.m.sort(function () {
		return 0.5 - Math.random();
	});
	iii(true);
};

//Create the tiles (HTML div elements)
iii = (resetPop) => {
	for (let i = 0; i < pixelParliament.m.length; i++) {
		$("article").append("<div class=\"tile\" name=\"" + i + "\" style=\"background-color:" + pixelParliament.m[i][2] + "\"></div>");
	}
	iv(resetPop);
};

//Size the tiles appropriately and deal with re-sorting
iv = (resetPop) => {
	let tileSize = Math.floor(Math.sqrt(((window.innerWidth - 25) * (window.innerHeight - 25)) / pixelParliament.m.length));
	$(".tile").css("width", tileSize + "px").css("height", tileSize + "px");
	//Resize the tiles if the window is resized
	window.addEventListener("resize", () => {
		let tileSize = Math.floor(Math.sqrt(((window.innerWidth - 25) * (window.innerHeight - 25)) / pixelParliament.m.length));
		$(".tile").css("width", tileSize + "px").css("height", tileSize + "px");
	});
	let active = resetPop ? -1 : false;
	//Display relevant pop-up when a tile is clicked
	$(".tile").click(f => {
		let code = $(f.target).attr("name");
		$(".member, .tile").removeClass("active");
		if (active != code) {
			$(f.target).addClass("active");
			setTimeout(() => {
				$(".member b[name=name]").html(pixelParliament.m[code][0]);
				$(".member span[name=party]").html(pixelParliament.m[code][1]);
				$(".member span[name=constit]").html(pixelParliament.m[code][3]);
				$(".member #member-footer").css("background-color", pixelParliament.m[code][2]);
				$(".member a[name=site]").show().attr("href", pixelParliament.m[code][4]);
				if (pixelParliament.m[code][4] == "null") {
					$(".member a[name=site]").hide();
				}
				$(".member a[name=twitter]").show().attr("href", pixelParliament.m[code][5]);
				if (pixelParliament.m[code][5] == "null") {
					$(".member a[name=twitter]").hide();
				}
				$(".member").addClass("active");
			}, (active == -1) ? 0 : 300);
			active = code;
		} else {
			active = -1;
		}
	});
	//Sort the tiles appropriately when a sort button is clicked
	pixelParliament.sorting = false;
	$(".sort").click(f => {
		if ($(f.target).hasClass("active") == false && pixelParliament.sorting == false) {
			pixelParliament.sorting = true;
			$(".member, .tile").removeClass("active");
			$("#loader").show().animate({"opacity": "1"}, 500, () => {
				$("#loader").finish();
				$(".sort.active").removeClass("active");
				$(f.target).addClass("active");
				//Sort by name/party
				pixelParliament.m.sort((function (index) {
					return function (a, b){
						return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
					};
				})($(f.target).attr("name") == "name" ? 0 : 1));
				//Random sort
				if ($(f.target).attr("name") == "random") {
					pixelParliament.m.sort(function () {
						return 0.5 - Math.random();
					});
				}
				$("article").html("");
				iii(false);
				//Hide the loading screen
				setTimeout(() => {
					$("#loader").animate({"opacity": "0"}, 500, () => {
						$("#loader").finish().hide();
						pixelParliament.sorting = false;
					});
				}, 1500);
			});
		}
	});
	//On first call of the function (initial sequence) hide the loading screen
	if (resetPop) {
		setTimeout(() => {
			$("#loader").animate({"opacity": "0"}, 500, () => {
				$("#loader").finish().hide();
			});
		}, 2500);
	}
};