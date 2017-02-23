$.getJSON("js/raw.json", function(data) {
	var source = [];

	$.each(data, function(i, d) {
		if ($(location).attr("pathname") == "lihkg.html") {
			console.log("Show only lihkg results.");
			if (i > 490)
				source.push(d);
		} else source.push(d);
	});

	console.log(source.length + " entries collected.");

	$(function() {
		$("#questions").val("q1");
		parseQuestions("q1");
	});

	$("#questions").change(function() {
		$("#gender").val("全部");
		$("#age").val("全部");
		parseQuestions($("#questions").val());
	});

	$("#gender").change(function() {
		parseQuestions($("#questions").val());
	})

	$("#age").change(function() {
		parseQuestions($("#questions").val());
	})

	function parseQuestions(number) {
		var name = $("#questions option:selected").text();

		if (number != "")
			switch (number) {
				case "q1":
				$("#gender").prop("disabled", "disabled");
				$("#age").prop("disabled", false);
				createChart(number, name, false, true);
				break;
				case "q2":
				$("#gender").prop("disabled", false);
				$("#age").prop("disabled", "disabled");
				createChart(number, name, true, false);
				break;
				case "q3":
				case "q4":
				case "q5":
				case "q6":
				case "q7":
				case "q8":
				case "q9":
				case "q10":
				case "q11":
				case "q12":
				case "q13":
				case "q14":
				case "q15":
				$("#gender").prop("disabled", false);
				$("#age").prop("disabled", false);
				createChart(number, name, true, true);
				break;
			}
	}

	function createChart(question, name, isGender, isAge) {
		var result = [],
			data = [],
			qnum = question.match(/\d+/)[0],
			attribute = "d." + question,
			genderFilter = (isGender) ? $("#gender").val() : "全部",
			ageFilter = (isAge)? $("#age").val() : "全部";

		if (question != "") {
			if (qnum >= 4 && qnum <= 12) {
				$.each(source, function(i, d) {
					if (d.q3 == "有")
						data.push(d);
				});
			} 
			else data = source;

			$.each(data, function(i, d) {
				if (d.q1 == genderFilter && d.q2 == ageFilter)
					result.push(eval(attribute));
				else if (d.q1 == genderFilter && ageFilter == "全部")
					result.push(eval(attribute));
				else if (genderFilter == "全部" && d.q2 == ageFilter)
					result.push(eval(attribute));
				else if (genderFilter == "全部" && ageFilter == "全部")
					result.push(eval(attribute));
			});
		}

		if (qnum == 6 || qnum == 8 || qnum == 10) {
			var temp = [];

			$.each(result, function(i, d) {
				d = d.replace("，", ", ");
				$.each(d.split(", "), function(i, d) {
					temp.push(d)
				})
			});

			result = temp;

			if (result.length > 0) {
				$("#result").html("");
				drawBarChart({
					titleText: name,
					subtitleText: "",
					data: getCounts(result),
					size: data.length
				});
			}
		}
		else if (result.length > 0) {
			$("#result").html("");
			drawPieChart({
				titleText: name,
				subtitleText: "",
				data: getCounts(result)
			});
		}
		else $("#result").html("沒有數據。");
	}

	function getCounts(data) {
		var counts = {};
		var arr = [];

		$.each(data, function(i, d) {
			counts[d] = (counts[d] || 0) + 1;
		});

		$.each(Object.keys(counts), function(i, d) {
			arr.push({
				label: d,
				value: counts[d]
			});
		});

		return arr;
	}

	function drawPieChart(options) {
		var canvasHeight = 400,
			canvasWidth = 590;

		var pie = new d3pie("result", {
			"header": {
				"title": {
					"text": options.titleText,
					"fontSize": 22,
					"font": "open sans"
				},
				"subtitle": {
					"text": options.subtitleText,
					"color": "#999999",
					"fontSize": 10,
					"font": "open sans"
				},
				"titleSubtitlePadding": 10
			},
			"footer": {
				"color": "#999999",
				"fontSize": 11,
				"font": "open sans",
				"location": "bottom-center"
			},
			"size": {
				"canvasHeight": canvasHeight,
				"canvasWidth": canvasWidth,
				"pieOuterRadius": "88%"
			},
			"data": {
				"sortOrder": "value-desc",
				"smallSegmentGrouping": {
					"enabled": true,
					"value": 2,
					"label": "其他"
				},
				"content": options.data
			},
			"labels": {
				"outer": {
					"format": "label-percentage1",
					"pieDistance": 32
				},
				"inner": {
					"format": "value"
				},
				"mainLabel": {
					"font": "open sans",
					"fontSize": 12
				},
				"percentage": {
					"color": "#aaaaaa",
					"font": "open sans",
					"decimalPlaces": 2
				},
				"value": {
					"color": "#ffffff",
					"font": "open sans"
				},
				"lines": {
					"enabled": true
				},
				"truncation": {
					"enabled": false
				}
			},
			"effects": {
				"pullOutSegmentOnClick": {
					"effect": "none"
				}
			},
			"misc": {
				"pieCenterOffset": {
					"y": 10
				}
			}
		});

	var svg = d3.select("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight);
	}

	function drawBarChart(options) {
		$("#result").html("<svg class='chart'></svg>");

		var data = options.data,
			sample = options.size,
			temp = [],
			others = 0;

		$.each(data, function(i, d) {
			(d.value / sample >= 0.02) ? temp.push(d) : others += d.value;
		});

		temp.push({
			label: "其他",
			value: others
		});

		temp.sort(function(a, b) {
			if (a.value < b.value)
				return 1;
			if (a.value > b.value)
				return -1;
			if (a.value == b.value)
				return 0;
		})

		data = temp;

		var	margin = {
				top: 60,
				right: 20,
				bottom: 20,
				left: 120
			},
			width = 590 - margin.left - margin.right,
			barHeight = 35,
			height = barHeight * data.length,
			color = d3.scale.category10();

		var x = d3.scale.linear()
			.domain([0, d3.max(data, function(d) {
				return d.value;
			})])
			.range([0, width]);

		var y = d3.scale.ordinal()
			.domain(data.map(function(d) {
				return d.label;
			}))
			.rangeRoundBands([0, height], 0);

		var chart = d3.select(".chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var bar = chart.selectAll("g")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d, i) {
				return "translate(0," + i * barHeight + ")";
			});

		bar.append("rect")
			.attr("width", 0)
			.transition()
			.duration(1000)
			.attr("width", function(d) {
				return x(d.value);
			})
			.attr("height", barHeight - 1)
			.attr("fill", function(d, i) {
				return color(i % data.length);
			});

		bar.append("text")
			.attr("class", function(d) {
				return x(d.value) < 80 ? "blacktext" : "whitetext";
			})
			.attr("x", function(d) {
				return x(d.value) + (x(d.value) < 80 ? 30 : -35);
			})
			.attr("y", barHeight / 2)
			.attr("dy", "0.35em")
			.text(function(d) {
				return d.value + " (" + (d.value / sample * 100).toFixed(2) + "%)";
			})
			.attr("opacity", 0)
			.transition()
			.delay(1000)
			.duration(1000)
			.attr("opacity", 1);

		var xAxis = d3.svg.axis()
			.scale(x, function(d) {
				return x(d.value);
			})
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.attr("opacity", 0)
			.call(xAxis)
			.transition()
			.delay(1000)
			.duration(1000)
			.attr("opacity", 1);

		chart.append("g")
			.attr("class", "y axis")
			.attr("opacity", 0)
			.call(yAxis)
			.transition()
			.delay(1000)
			.duration(1000)
			.attr("opacity", 1);

		chart.append("text")
			.attr("class", "title")
			.attr("x", width / 2)
			.attr("y", 0 - (margin.top / 2))
			.text(options.titleText);

		console.log("Bar Chart Done");
	}
});

