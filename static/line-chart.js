var twacker = twacker || {};

(function(twacker) {
  twacker.lineChart = function() {
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = 480 - 100 - margin.right - margin.left;
    var height = 50;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.count); });

    var data;

    function chart(selection) {
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain(d3.extent(data, function(d) { return d.count; }));

      var svg = selection.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('line')
          .attr('x1', x(data[0].date))
          .attr('y1', y(data[0].count))
          .attr('x2', x(data[data.length - 1].date))
          .attr('y2', y(data[0].count))
          .style('stroke', '#e5e5e5')
          .style('stroke-width', '2px');

      svg.append('path')
          .datum(data)
          .attr('class', 'line')
          .attr('d', line)
          .style('stroke', '#000')
          .style('fill', 'none')
          .style('stroke-width', '2px');

      svg.append('circle')
          .datum(data[data.length - 1])
          .attr('r', 4)
          .attr('cx', function(d) { return x(d.date); })
          .attr('cy', function(d) { return y(d.count); })
          .style('fill', function(d, i) {
            if (d.difference === 0) return 'steelblue';
            return d.difference > 0 ? '#2ca02c' : '#d62728' ;
          });
    }

    chart.data = function(value) {
      if (!arguments.length) return data;
      data = value;
      return chart;
    }

    return chart;
  };
})(twacker);
