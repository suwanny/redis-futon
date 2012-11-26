'use strict';

angular.module('futonFilters', []).filter('checkpatterns', function() {
  return function(patterns) {
    return patterns.length > 0 ? "<div class='alert alert-info'><b>patterns: </b>" + patterns + "</div>": '';
  };
});
