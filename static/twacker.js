var twacker = twacker || {};

(function(twacker) {
  var date = d3.time.format('%Y-%m-%d');
  twacker.dispatch = d3.dispatch('open');

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
    }) || 5;

    var datesChart = twacker.dateChart()
      .data(stats.reverse());
    d3.select('.dates').call(datesChart);

    var followersChart = twacker.barChart()
      .data(followers)
      .xDomain([-lim, lim]);
    d3.select('.followers').call(followersChart);

    var friendsChart = twacker.barChart()
      .data(friends)
      .xDomain([-lim, lim]);
    d3.select('.friends').call(friendsChart);

    var followersLine = twacker.lineChart()
      .data(followers.reverse());
    d3.select('.followers .line').call(followersLine);

    var friendsLine = twacker.lineChart()
      .data(friends.reverse());
    d3.select('.friends .line').call(friendsLine);

    if (stats.length) {
      twacker.dispatch.open();
    } else {
      d3.selectAll('.no-data')
        .classed('hidden', false);
    }
  });
})(twacker);
