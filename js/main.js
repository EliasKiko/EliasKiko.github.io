/*
*    main.js
*    line chart + bar chart
*    
*/


// set the dimensions and margins of the graph
const margin = { top: 40, right: 40, bottom: 60, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// time parser for x-scale
const parseDate = d3.timeParse("%m/%d/%Y"),
    formatDate = d3.timeFormat("%m/%d/%Y"),//("%b %d"),
    formatMonth = d3.timeFormat("%b"),
	formatYear = d3.timeFormat("%Y");


// scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);


// line path generator
const valueline = d3
    .line()
    .x((d) => { return x(d.date); })
    .y((d) => { return y(d.value); })
    .curve(d3.curveCardinal);

// append the svg object to the body of the page

const svg = d3.select("#chart-area").append("svg")
	.attr("width", 1200)
	.attr("height", 800)
	;

const g = d3
    .select("svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(formatMonth)); 
	
g.append("g").
	attr("class", "y axis")
	//.call(d3.axisLeft(y));

// axis labels
const xLabel = g.append("text")
				.attr("class", "x axisLabel")
				.attr("y", height + 50)
				.attr("x", width / 2)
				.attr("font-size", "20px")
				.attr("text-anchor", "middle")
				//.text("Time")
const yLabel = g.append("text")
				.attr("class", "y axisLabel")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.attr("fill", "#5D6971")
				.text("(Cases)")


appendData(2020);

function appendData(year) {
	
	//use slider to change year
	var slider = d3.select('#year');
	slider.on('change', function() {
		appendData(this.value);
	});
	
	//reset graphs
    d3.selectAll("path.line").remove();
    d3.selectAll(".title").remove();
    d3.selectAll(".annotation").remove();
	d3.selectAll("rect").remove();

    //filename = "data/Covid" + year + ".csv";
	//one data file
	//filename = "data/Covid_Data.csv";
	

    d3.csv('https://raw.githubusercontent.com/EliasKiko/EliasKiko.github.io/main/Data/Covid_Data.csv').then((data) => {
		//filter data by selected year
		data = data.filter(function(d) {return formatYear(parseDate(d.date)) == year});
        //data = data.sort(function(a, b){ return d3.ascending(a.date, b.date); });
        data.forEach((d) => {
			d.date = parseDate(d.date);
            d.value = Number(d.value);
			d.new_cases = Number(d.new_cases);
		
        });

		var first_date = new Date(year, 0, 1);
		var last_date = new Date(year, 11, 31);
		var diffDays = Math.ceil(Math.abs(last_date - first_date) / (1000 * 60 * 60 * 24));

		// set scale domains
        x.domain(
            //d3.extent(data, (d) => { return d.date; })
			[first_date,last_date]
        );
        y.domain([
            0,
			//d3.max(data, (d) => { return d.value})
            d3.max(data, (d) => { return d.value < d.new_cases ? d.new_cases * 1.05 : d.value * 1.05; })
			//800000
        ]);
				
	
		// generate axes once scales have been set
        svg
            .select(".x.axis") 
            //.transition()
            //.duration(1000)
            .call(d3.axisBottom(x).ticks(12).tickFormat(formatMonth))
				.selectAll("text")
				.attr("y", "10")
				.attr("x", "50")
				.attr("text-anchor", "end")
				;
        g
            .select(".y.axis") 
            .transition()
            .duration(500)
            .call(d3.axisLeft(y));

   
		// update xLabel
		xLabel.text("Year " + year);

		// add bar to chart
		g.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar")			
			.attr("y", d => y(d.new_cases))
			.attr("x", d => x(d.date))
			.attr("width", width/diffDays-0.01 ) //x_bar.bandwidth)
			.attr("height", d => height - y(d.new_cases))
			.attr("fill", "#b3cde3")
			.attr("opacity", 0.7);
		
		// add line to chart
		g.append("path")
			.attr("class", "line")
			.attr("fill", "none")
			.attr("stroke", "#607D8B")
			.attr("stroke-width", "3px")
			.attr("d", valueline(data))	
			.transition()
            .duration(1000);

		//Add a title
        g
            .append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
			//.style("font", "24px times")
			//.style("font-weight","bold")
            .text("Covid 19 - US New  Reported Cases " + year);



		
		/******************************** Annonation ********************************/
        const annotations= [
			// first annotation
			{
				note: {
				  label: "First case reported",
				  title: "January 20, 2020",
				  wrap: 150,  // try something smaller to see text split in several lines
				  padding: 10   // More = text lower
				
			   	},
				color: ["#00796B"],
				x: x(parseDate('01/20/2020')),
				y: y(1),
				dy: -50,
				dx: 0,
				type: d3.annotationCalloutElbow,
				year: 2020,
			  },
		 	// second annotation
			{
				note: {
				  label: "President Trump declares a nationwide emegency",
				  title: "March 13, 2020",
				  wrap: 150,  // try something smaller to see text split in several lines
				  padding: 10   // More = text lower
				
			   	},
				color: [" #00796B"],
				x: x(parseDate('03/13/2020')),
				y: y(1),
				dy: -100,
				dx: 0,
				type: d3.annotationCalloutElbow,
				year: 2020,
			},
			// Third annotation
			{
				note: {
					label: "Surge of infection heading winter",
					title: "Winter 2020",
					wrap: 150,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
		   		color: ["#cc0000"],
				x: x(parseDate('12/15/2020')),
				y: y(220000),
				dy: -10,
				dx: -70,
				subject: {
					radius: 35,
					radiusPadding: 5
		  		},
				type: d3.annotationCalloutCircle,
				year: 2020,
		  	},	
			// 4th annotation
		 	{
				note: {
					label: "Delta variant spread rapidly",
					title: "Summer 2021",
					wrap: 130,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
		   		color: ["#cc0000"],
				x: x(parseDate('08/30/2021')),
				y: y(166239),
				dy: -100,
				dx: -5,
				subject: {
					radius: 50,
					radiusPadding: 5
		  		},
				type: d3.annotationCalloutCircle,
				year: 2021,
		  	},	 
			//annotation
			{
				note: {
					label: "Vaccine roll out to general public",
					title: "March 2021",
					wrap: 140,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
				color: ["#00796B"],
				x: x(parseDate('03/15/2021')),
				y: y(54312),
				dy: -60,
				dx: 0,
				type: d3.annotationCalloutElbow,
				year: 2021,
		  	},	 
			// Third annotation
			{
				note: {
					label: "Omicron variant",
					title: "January 2022",
					wrap: 150,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
		   		color: ["#cc0000"],
				x: x(parseDate('01/16/2022')),
				y: y(755000),
				dy: -50,
				dx: 40,
				subject: {
					radius: 30,
					radiusPadding: 5
		  		},
				type: d3.annotationCalloutCircle,
				year: 2022,
		  	},
			//annotation
			{
				note: {
					label: "New cases drop 95% from the peak",
					title: "March 15, 2022",
					wrap: 150,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
				color: ["#00796B"],
				x: x(parseDate('03/15/2022')),
				y: y(30739),
				dy: -100,
				dx: 0,
				subject: {
					radius: 50,
					radiusPadding: 5
		  		},
				type: d3.annotationCalloutElbow,
				year: 2022,
		  	},		 
			//annotation
			{
				note: {
					label: "BA.5 subvariant become the predominant variant in US",
					title: "July 2022",
					wrap: 120,  // try something smaller to see text split in several lines
					padding: 10   // More = text lower
					
				},
				color: ["steelblue"],
				x: x(parseDate('07/01/2022')),
				y: y(120000),
				dy: -100,
				dx: 0,
				subject: {
					radius: 50,
					radiusPadding: 5
		  		},
				type: d3.annotationCalloutElbow,
				year: 2022,
		  	},	
			
		]
		var filteredAnnotations = annotations.filter(annotations => annotations.year == year);
		//console.log(filteredAnnotations);

		window.makeAnnotations = d3.annotation()
			.annotations(filteredAnnotations);
		  
		g.append("g")
			.attr("class", "annotation")
		 	.call(makeAnnotations);
		/******************************** End of Annonation ********************************/
       
		/******************************** Tooltip Code ********************************/
		// This allows to find the closest date index of the mouse:
		var bisect = d3.bisector(function(d) { return d.date; }).left;

		// Create the tooltip that travels along the curve of chart
		var focus = g
			.append('g')
			.attr("class","focus")
			.style("display", "none");
		
		// Create the circle that travels along the curve of chart	
		focus	
			.append("circle")
			.attr("class","y")
			.attr("stroke", "steelblue")
			.attr('r', 5)
			.style("fill", "none")
		
		// Create the rectangle that contains the text description	
		focus	
			.append("rect")
			.attr("class","t")
			.attr("stroke", "grey")
			.attr('width', 110)
			.attr('height',57)
			.style("fill", "white")
			.attr("opacity", 0.8)
			
		// Create the text that travels along the curve of chart	
		focus
			.append("text")
			.attr("class", "line1")
			.attr("dx", 8)
			.attr("dy", "-.3em")
			.attr("text-anchor", "left")
		  	.attr("alignment-baseline", "middle")
            .style("font", "12px times")
            .style("fill", "#083e80")
			.style("font-weight","bold");

		focus
			.append("text")
			.attr("class", "line2")
			.attr("dx", 8)
			.attr("dy", "-.3em")
			.attr("text-anchor", "left")
		  	.attr("alignment-baseline", "middle")
            .style("font", "12px times")
            .style("fill", "#083e80");
		
		focus
			.append("text")
			.attr("class", "line3")
			.attr("dx", 8)
			.attr("dy", "-.3em")
			.attr("text-anchor", "left")
		  	.attr("alignment-baseline", "middle")
            .style("font", "12px times")
            .style("fill", "grey");

		 // Create a rect on top of the svg area: this rectangle recovers mouse position
		 g
			.append('rect')
			.style("fill", "none")
			.style("pointer-events", "all")
			.attr('width', width)
			.attr('height', height)
			.on('mouseover', mouseover)
			.on('mousemove', mousemove)
			.on('mouseout', mouseout);
		
		// What happens when the mouse move -> show the tooltip at the right positions.
		function mouseover() {
			focus.style("display",null)
			//focus.style("opacity", 1)
			//focusText.style("opacity",1)
		}
		
		function mousemove() {
			// recover coordinate we need
			//console.log(d3.mouse(this));
			var x0 = x.invert(d3.mouse(this)[0]);
			var i = bisect(data, x0,1),
			d0 = data[i-1],
			d1 = data[i] , //if out of range, undefined
			selectedData = (d1 === undefined) || (x0 - d0.date < d1.date - x0) ? d0 : d1;
			//console.log(selectedData)

			focus
			  .select("circle.y")
			  .attr("cx", x(selectedData.date))
			  .attr("cy", y(selectedData.value));
			
			focus
			  .select("rect.t")
			  .attr("x", width - (x(selectedData.date) -12) > 85? (x(selectedData.date) -12) : (x(selectedData.date) -135) )
			  .attr("y", (y(selectedData.value)-65));
			  
			focus
			  .select("text.line1")
			  .attr("transform", "translate(" + 
			  		(width - (x(selectedData.date)-15) > 85 ? (x(selectedData.date)-15) : (x(selectedData.date) -138))
			  		+ "," + (y(selectedData.value)-50) + ")")
			  .text(d3.timeFormat("%b %d, %Y")(selectedData.date));
			
			focus
			  .select("text.line2")
			  .attr("transform", "translate(" + 
			  		(width - (x(selectedData.date)-15) > 85 ? (x(selectedData.date)-15) : (x(selectedData.date) -138))
					+ "," + (y(selectedData.value)-32) + ")")
			  .text("7-day Avg: " + d3.format(",.0f")(selectedData.value));

			focus
			  .select("text.line3")
			  .attr("transform", "translate(" + 
			  		(width - (x(selectedData.date)-15) > 85 ? (x(selectedData.date)-15) : (x(selectedData.date) -138))
					+ "," + (y(selectedData.value)-14) + ")")
			  .text("New cases: " + d3.format(",.0f")(selectedData.new_cases));

		}
		function mouseout() {
			focus.style("display", "none")
		}
		/******************************** Tooltip Code ********************************/

		//** Legend */
		const mesurements = ["7-day Average", "Daily New Cases"];
		const mesurementColor = ["#607D8B","#b3cde3"];
		const legend = g.append("g")
			.attr("class","legend")
			.attr("transform", `translate(${width }, ${height - 365})`)

		mesurements.forEach((mesurement, i) => {
			const legendRow = legend.append("g")
								.attr("transform", `translate(0, ${i * 20})`)

		legendRow.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", mesurementColor[i])

		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(mesurement)
		})
    });
}



