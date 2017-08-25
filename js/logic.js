var CLIENT_ID = '764637031425-m650c1qsp7esereg198mr3lvhffnhood.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAtZCw-S9NvomUDRvJRdmrjjAlGgfbsHgE';
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var SHEET_ID = '1GVYlCDuwv6jXpcNfgEVCILGLOBzP6tGJFC4Yh_pbbeU';
var RANGE = 'Form Responses';

function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

function initClient() {
	gapi.client.init({
		discoveryDocs: DISCOVERY_DOCS,
		clientId: CLIENT_ID,
		scope: SCOPES,
		apiKey: API_KEY
	}).then(function () {
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: SHEET_ID,
			range: RANGE,
		}).then(function(response) {
			var source = response.result.values;
			if (source.length > 0) {
				source.shift();

				$(function() {
					$("#gender").val("全部");
					$("#age").val("全部");
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
						attribute = "d[" + qnum + "]",
						genderFilter = (isGender) ? $("#gender").val() : "全部",
						ageFilter = (isAge)? $("#age").val() : "全部";

						if (question != "") {
							if (qnum >= 4 && qnum <= 12) {
								$.each(source, function(i, d) {
									if (d[3] == "有")
										data.push(d);
								});
							} 
							else data = source;

							$.each(data, function(i, d) {
								if (d[1] == genderFilter && d[2] == ageFilter)
									result.push(eval(attribute));
								else if (d[1] == genderFilter && ageFilter == "全部")
									result.push(eval(attribute));
								else if (genderFilter == "全部" && d[2] == ageFilter)
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
								console.log(getCounts(result));
								drawPieChart({
									titleText: name,
									subtitleText: $("#gender").val() + " / " + $("#age").val() + ($("#age").val() == "全部" ? "" : "歲"),
									data: getCounts(result),
									size: data.length
								});
								showTable(getCounts(result));
								$("#message").empty();
							}
						}
						else if (result.length > 0) {
							console.log(getCounts(result));
							drawPieChart({
								titleText: name,
								subtitleText: $("#gender").val() + " / " + $("#age").val() + ($("#age").val() == "全部" ? "" : "歲"),
								data: getCounts(result)
							});
							showTable(getCounts(result));
							$("#message").empty();
						}
						else {
							$("#chart").html("");
							$("#details").empty();
							$(".dataTables_info").empty();
							$("#message").html("沒有數據。");
						}
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
								value: counts[d],
								percentage: (counts[d] / data.length * 100).toFixed(2)
							});
						});

						return arr;
					}

					function drawPieChart(options) {
						var canvasHeight = 400,
						canvasWidth = 600;

						$("#chart").html("");

						var pie = new d3pie("chart", {
							"header": {
								"title": {
									"text": options.titleText,
									"fontSize": 24,
									"font": "Courier"
								},
								"subtitle": {
									"text": options.subtitleText,
									"color": "#999999",
									"fontSize": 12,
									"font": "Courier"
								},
								"titleSubtitlePadding": 10
							},
							"footer": {
								"color": "#999999",
								"fontSize": 12,
								"font": "Courier",
								"location": "bottom-center"
							},
							"size": {
								"canvasHeight": canvasHeight,
								"canvasWidth": canvasWidth,
								"pieInnerRadius": "50%",
								"pieOuterRadius": "75%"
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
									"font": "Courier",
									"fontSize": 12
								},
								"percentage": {
									"color": "#aaaaaa",
									"font": "Courier",
									"decimalPlaces": 2
								},
								"value": {
									"color": "#ffffff",
									"font": "Courier"
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

					function showTable(data) {
						$("#message").empty();
						$("#details").DataTable({
							"data": data,
							"paging": false,
							"searching": false,
							"destroy": true,
							"columns": [{
								"data": "label",
								"title": "選擇"
							}, {
								"data": "value",
								"title": "數目"
							}, {
								"data": "percentage",
								"title": "百分比"
							}],
							"order": [
							[1, "dsc"]
							]
						});
					}
			} else {
				console.log('No data found.');
			}
		}, function(response) {
			console.log('Error: ' + response.result.error.message);
		});
	});
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-93946461-1', 'auto');
ga('send', 'pageview');
