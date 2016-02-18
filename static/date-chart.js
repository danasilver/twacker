var twacker = twacker || {};

(function(twacker) {
  twacker.dateChart = function() {
    var margin = {top: 20, bottom: 40};
    var width = 200;
    var height;
    var y = d3.scale.ordinal();
    var data;

    var format = d3.time.format('%-m/%d/%y');

    function chart(selection) {
      y.domain(data.map(function(d) { return d.date; }))
        .rangeRoundBands([0, height - 100], 0.2);

      var svg = selection.append('svg')
          .attr('height', height + margin.top + margin.bottom)
          .attr('width', width)
        .append('g')
          .attr('transform', 'translate(0,' + margin.top + ')');

      var dates = svg.selectAll('.date')
          .data(data)
        .enter().append('g')
          .attr('class', 'date')
          .attr('transform', function(d) { return 'translate(0,' + y(d.date) + ')'; });

      dates.append('rect')
          .attr('x', width / 2 - 30)
          .attr('y', y.rangeBand() / 2 - 12)
          .attr('width', 60)
          .attr('height', 25)
          .attr('ry', 5);

      dates.append('text')
          .attr('x', width / 2)
          .attr('y', y.rangeBand() / 2)
          .attr('dy', '.32em')
          .style('text-anchor', 'middle')
          .style('font-size', '13px')
          .text(function(d) { return format(d.date); });
    }

    chart.data = function(value) {
      if (!arguments.length) return data;
      data = value;
      height = value.length * 35 - margin.top - margin.bottom + 100;
      return chart;
    }

    return chart;
  }
})(twacker);
