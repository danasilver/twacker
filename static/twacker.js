(function() {
  var date = d3.time.format('%Y-%m-%d');

  d3.json('/stats', function(stats) {
    // Map followers and friends arrays from stats
    // Reverse the arrays after sorting to preserve
    // the difference ordering
    var followers = stats.map(function(d, i) {
      return {
        date: date.parse(d.date),
        count: d.followers_count,
        difference: i > 0
          ? d.followers_count - stats[i - 1].followers_count
          : 0,
        added: d.followers_added,
        removed: d.followers_removed
      };
    }).reverse();

    var friends = stats.map(function(d, i) {
      return {
        date: date.parse(d.date),
        count: d.friends_count,
        difference: i > 0
          ? d.friends_count - stats[i - 1].friends_count
          : 0,
        added: d.friends_added,
        removed: d.friends_removed
      };
    }).reverse();

    var lim = d3.max(stats, function(d) {
      return Math.max(d.followers_added.length, d.followers_removed.length,
                      d.friends_added.length, d.friends_removed.length);
    });

    var followersChart = verticalBarChart()
      .data(followers)
      .xDomain([-lim, lim])
      .showDates(true);
    d3.select('.followers').call(followersChart);

    var friendsChart = verticalBarChart()
      .data(friends)
      .xDomain([-lim, lim]);
    d3.select('.friends').call(friendsChart);
  });

  function verticalBarChart() {
    var margin = {top: 20, right: 10, bottom: 40, left: 10};
    var width = 480 - 100 - margin.right - margin.left;

    var x = d3.scale.linear();
    var y = d3.scale.ordinal();
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('top')
        .tickFormat(d3.format('d'));
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('right')
        .tickSize(0, 0, 0)
        .tickFormat(d3.time.format('%-m/%d/%y'));

    // Set data after creating the chart
    var data;

    // Default to not showing dates on the xAxis
    var showDates = false;

    function chart(selection) {
      x.range([0, width]);
      y.domain(data.map(function(d) { return d.date; }))
        .rangeRoundBands([0, height], 0.2);

      xAxis.tickSize(-height, 0, 0);

      var svg = selection.append('svg')
          .attr('width', function () {
            if (showDates) return width + 200 + margin.left + margin.right;
            return width + margin.left + margin.right;
          })
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g')
          .attr('class', 'x axis')
          .call(xAxis);

      svg.selectAll('.bar.negative')
          .data(data)
        .enter().append('g')
          .attr('class', 'bar negative')
          .attr('transform', function(d) {
            return 'translate(' + x(-d.removed.length) + ',' + y(d.date) + ')'; })
        .append('rect')
          .attr('height', y.rangeBand())
          .attr('width', function(d) { return Math.abs(x(d.removed.length) - x(0)); })
          .attr('rx', 7)
          .attr('ry', 7);

      svg.selectAll('.bar.positive')
          .data(data)
        .enter().append('g')
          .attr('class', 'bar positive')
          .attr('transform', function(d) {
            return 'translate(' + x(0) + ',' + y(d.date) + ')'; })
        .append('rect')
          .attr('height', y.rangeBand())
          .attr('width', function(d) { return Math.abs(x(d.added.length) - x(0)); })
          .attr('rx', 7)
          .attr('ry', 7);

      svg.append('g')
          .attr('class', 'y centerline')
        .append('line')
          .attr('x1', x(0))
          .attr('x2', x(0))
          .attr('y2', height);

      if (showDates) {
        svg
          .append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (width + 100) + ',0)')
            .call(yAxis);
      }
    }

    chart.data = function(value) {
      if (!arguments.length) return data;
      data = value;
      height = value.length * 35 - margin.top - margin.bottom;
      return chart;
    }

    chart.showDates = function(value) {
      if (!arguments.length) return showDates;
      showDates = value;
      return chart;
    }

    chart.xDomain = function(value) {
      if (!arguments.length) return x.domain();
      x.domain(value);
      return chart;
    }

    return chart;
  }
})();
