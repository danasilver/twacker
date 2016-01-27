(function() {
  var margin = {top: 10, right: 20, bottom: 40, left: 60};
  var width = 960 - margin.right - margin.left;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  var date = d3.time.format('%Y-%m-%d');

  var chart = d3.select('main').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.json('test.json', function(stats) {
    stats.forEach(function (d) {
      d.date = date.parse(d.date);
    });

    x.domain(stats.map(function(d) { return d.date; }));
    y.domain(d3.extent(stats, function(d) { return d.followers_count; }));

    var bar = chart.selectAll('.bar')
        .data(stats)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function(d) { return 'translate(' + x(d.date) + ',0)' })
      .append('rect')
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d.followers_count); })
        .attr('height', function(d) { return height - y(d.followers_count); });
  });
})();
