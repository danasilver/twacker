(function() {
  var date = d3.time.format('%Y-%m-%d');
  var dispatch = d3.dispatch('open');

  d3.json('/stats', function(stats) {
    stats.forEach(function(d) {
      d.date = date.parse(d.date);
    });

    // Map followers and friends arrays from stats
    // Reverse the arrays after sorting to preserve
    // the difference ordering
    var followers = stats.map(function(d, i) {
      return {
        date: d.date,
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
        date: d.date,
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

    var datesChart = dates()
      .data(stats.reverse());
    d3.select('.dates').call(datesChart);

    var followersChart = verticalBarChart()
      .data(followers)
      .xDomain([-lim, lim]);
    d3.select('.followers').call(followersChart);

    var friendsChart = verticalBarChart()
      .data(friends)
      .xDomain([-lim, lim]);
    d3.select('.friends').call(friendsChart);

    dispatch.open()
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

    // Set data after creating the chart
    var data;

    // Height is set based on the length of the data
    var height;

    function chart(selection) {
      x.range([0, width]);
      y.domain(data.map(function(d) { return d.date; }))
        .rangeRoundBands([0, height - 100], 0.2);

      xAxis.tickSize(-height, 0, 0);

      var svg = selection.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g')
          .attr('class', 'x axis')
          .call(xAxis);

      var negative = svg.selectAll('.bar-group.negative')
          .data(data)
        .enter().append('g')
          .attr('class', 'bar-group negative')
          .attr('transform', function(d) {
            return 'translate(0,' + y(d.date) + ')'; });

      negative.append('rect')
          .attr('class', 'cover')
          .attr('height', function(d, i) { return (width / 10) * Math.ceil((data[i - 1] || data[0]).removed.length / 5); })
          .attr('width', width / 2)
          .attr('y', -5)
          .style('fill', '#fff');

      negative.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,-5)')
          .call(xAxis.tickFormat(''));

      negative.append('rect')
          .attr('class', 'bar')
          .attr('x', function(d) { return x(-d.removed.length); })
          .attr('height', y.rangeBand())
          .attr('width', function(d) { return Math.abs(x(d.removed.length) - x(0)); })
          .attr('rx', 7)
          .attr('ry', 7);

      negative.append('g')
        .selectAll('image')
          .data(function(d) { return d.removed; })
        .enter().append('g')
          .attr('transform', function (d, i) {
            var xBase = x(0) - width / 10;
            var xOffset = (i % 5) * (width / 10) ;
            var yBase = y.rangeBand() + 1;
            var yOffset = (width / 10) * Math.floor(i / 5);
            return 'translate(' + (xBase - xOffset) + ',' + (yBase + yOffset) + ')';
          })
        .append('a')
          .attr('xlink:href', function(d) { return d.url; })
          .attr('target', 'blank')
        .append('image')
          .attr('x', 1)
          .attr('y', 1)
          .attr('height', width / 10 - 2)
          .attr('width', width / 10 - 2)
          .attr('xlink:href', function(d) { return d.profile_image_url; })
          .on('mouseover', function(d) {
            var tooltip = d3.select('.tooltip');

            tooltip
                .html(d.name + '<br>@' + d.screen_name);

            var image = d3.select(this),
                bounds = this.getBoundingClientRect(),
                left = bounds.left + image.attr('width') / 4 - parseFloat(tooltip.style('width')) / 2,
                top = bounds.top + document.body.scrollTop - image.attr('height') / 2 - parseFloat(tooltip.style('height')) - 7;

            tooltip
                .style('left', left + 'px')
                .style('top', top + 'px')
                .style('visibility', 'visible');
          })
          .on('mouseout', function() {
            d3.select('.tooltip')
                .style('visibility', 'hidden');
          });

      var positive = svg.selectAll('.bar-group.positive')
          .data(data)
        .enter().append('g')
          .attr('class', 'bar-group positive')
          .attr('transform', function(d) {
            return 'translate(' + x(0) + ',' + y(d.date) + ')'; });

      positive.append('rect')
          .attr('class', 'cover')
          .attr('height', function(d, i) { return (width / 10) * Math.ceil((data[i - 1] || data[0]).added.length / 5); })
          .attr('width', width / 2)
          .attr('y', -5)
          .style('fill', '#fff');

      positive.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,-5)')
          .call(xAxis.tickFormat(''));

      positive.append('rect')
          .attr('class', 'bar')
          .attr('height', y.rangeBand())
          .attr('width', function(d) { return Math.abs(x(d.added.length) - x(0)); })
          .attr('rx', 7)
          .attr('ry', 7);

      positive.append('g')
        .selectAll('image')
          .data(function(d) { return d.added; })
        .enter().append('g')
          .attr('transform', function (d, i) {
            var xBase = 1;
            var xOffset = (i % 5) * (width / 10);
            var yBase = y.rangeBand() + 1;
            var yOffset = (width / 10) * Math.floor(i / 5);
            return 'translate(' + (xBase + xOffset) + ',' + (yBase + yOffset) + ')';
          })
        .append('a')
          .attr('xlink:href', function(d) { return d.url; })
          .attr('target', 'blank')
        .append('image')
          .attr('x', 1)
          .attr('y', 1)
          .attr('height', width / 10 - 2)
          .attr('width', width / 10 - 2)
          .attr('xlink:href', function(d) { return d.profile_image_url; })
          .on('mouseover', function(d) {
            var tooltip = d3.select('.tooltip');

            tooltip
                .html(d.name + '<br>@' + d.screen_name);

            var image = d3.select(this),
                bounds = this.getBoundingClientRect(),
                left = bounds.left + image.attr('width') / 4 - parseFloat(tooltip.style('width')) / 2,
                top = bounds.top + document.body.scrollTop - image.attr('height') / 2 - parseFloat(tooltip.style('height')) - 7;

            tooltip
                .style('left', left + 'px')
                .style('top', top + 'px')
                .style('visibility', 'visible');
          })
          .on('mouseout', function() {
            d3.select('.tooltip')
                .style('visibility', 'hidden');
          });

      d3.selectAll('.bar-group .x.axis line')
          .attr('y2', function () { return this.parentNode.parentNode.parentNode.querySelector('.cover').getAttribute('height'); });

      var moving = d3.selectAll('.bar-group, .date');
      function move(target) {
        moving
            .classed('open', false)
            .filter(function(d) { return d.date === target.date; })
            .classed('open', true);

        moving
            .filter(function (d) { return d.date < target.date; })
            .transition()
            .attr('transform', function (d) {
              var t = d3.transform(d3.select(this).attr('transform')).translate;
              return 'translate(' + t[0] + ',' + (y(d.date) + 100) + ')';
            });

        moving
            .filter(function (d) { return d.date >= target.date; })
            .transition()
            .attr('transform', function (d) {
              var t = d3.transform(d3.select(this).attr('transform')).translate;
              return 'translate(' + t[0] + ',' + y(d.date) + ')';
            });
      }

      d3.selectAll('.bar, .date').on('click', move);
      dispatch.on('open', function() { move(d3.select('.date').datum()); });

      svg.append('g')
          .attr('class', 'y centerline')
        .append('line')
          .attr('x1', x(0))
          .attr('x2', x(0))
          .attr('y2', height);
    }

    chart.data = function(value) {
      if (!arguments.length) return data;
      data = value;
      height = value.length * 35 - margin.top - margin.bottom + 100;
      return chart;
    }

    chart.xDomain = function(value) {
      if (!arguments.length) return x.domain();
      x.domain(value);
      return chart;
    }

    return chart;
  }

  function dates() {
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
          .attr('y', y.rangeBand() / 2 - 13)
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

  var tooltip = d3.select('body').append('svg')
      .attr('width', 200)
      .attr('height', 100)
    .append('g')
      .attr('transform', 'translate(10, 10)');

  tooltip.append('text')
      .text()
})();
