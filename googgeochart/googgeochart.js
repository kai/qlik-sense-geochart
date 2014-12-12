// Hacked together aimlessly by Kai Hilton-Jones

require.config({
	paths : {
		//create alias to plugins
		async : '/extensions/googtimeline/async',
		goog : '/extensions/googtimeline/goog',
		propertyParser : '/extensions/googtimeline/propertyParser',
	}
});
define(["jquery", 'goog!visualization,1,packages:[geochart]'], function($) {'use strict';
	return {
		initialProperties : {
			version : 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 20,
					qHeight : 400
				}]
			},
			chartType : "timeline",
			showRowLabels : true,
			groupByRowLabel : false
		},
		//property panel
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max : 1
				},
				measures : {
					uses : "measures",
					min : 1,
					max : 2
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings",
					items : 
					{
						selection1 : 
						{
							type : "boolean",
							component : "switch",
							label : "Show Row Labels",
							ref : "showRowLabels",
							options : [{
								value : true,
								label : "On"
							},{
								value : false,
								label : "Off"
							}]
						},
						selection2 : 
						{
							type : "boolean",
							component : "switch",
							label : "Group Row Label",
							ref : "groupByRowLabel",
							options : [{
								value : true,
								label : "On"
							},{
								value : false,
								label : "Off"
							}]
						}

					}
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},

		paint : function($element, layout) {

			var self = this, elemNos = [], dimCount = this.backendApi.getDimensionInfos().length;
			var data = new google.visualization.DataTable();

			this.backendApi.getDimensionInfos().forEach(function(dim) {
				data.addColumn('string', dim.qFallbackTitle);
			});
			this.backendApi.getMeasureInfos().forEach(function(meas) {
				data.addColumn('number', meas.qFallbackTitle);
			});

			this.backendApi.eachDataRow(function(key, row) {
				var values = [];
				row.forEach(function(cell, col) {
					values.push(col < dimCount ? cell.qText : cell.qNum);
				});
				data.addRows([values]);
				//selections will always be on first dimension
				elemNos.push(row[0].qElemNumber);
			});
			
			var chart = new google.visualization.GeoChart($element[0]);

			var options = {
							//colorAxis: {colors: ['#00853f', 'black', '#e31b23']}	
						};

			//Instantiating and drawing the chart
			//var chart = new google.visualization[layout.chartType]($element[0]);
			chart.draw(data, options);
			//selections
			var selections = [];
			google.visualization.events.addListener(chart, 'select', function(e) {
				var sel = chart.getSelection();
				sel.forEach(function(val) {
					self.selectValues(0, [elemNos[val.row]], false);
				});
				selections = selections.concat(sel);
				chart.setSelection(selections);
			});

		}
	};

});
