require('angular');
require('angular-route');

(function () {
  'use strict';
  var app = angular.module('blog',['ngRoute']);
  var part1 = '9e036a59681409c5f542';
  var part2 = '72e86d69d37a005ad650';
  var newGist = {};

  app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'views/gists/gist_preview.html',
      controller: 'GistListController'
    })
    .when('/detail/:g_id', {
      templateUrl: 'views/gist/gist_detail.html',
      controller: 'GistController'
    })
    .when('/detail/:g_id/edit', {
      templateUrl: 'views/gist/edit_gist_form.html',
      controller: 'GistFormController'
    })
    .when('/detail/:g_id/delete', {
      templateUrl: 'views/gists/gist_preview.html',
      controller: 'GistDeleteController'
    })
    .when('/new', {
      templateUrl: 'views/gist/new_gist_form.html',
      controller: 'GistFormController'
    });
  });

  app.service('dataService', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    this.getGistList = function() {
        return $http({
            method: 'GET',
            url: 'https://api.github.com/users/mollyfish/gists',
            headers: {'Authorization': 'token ' + part1 + part2}
        }).then(function(resp, err) {
          return resp.data;
        });
      };

    this.getGistData = function (gistId) {
      return $http({
        method: 'GET',
        url: 'https://api.github.com/gists/' + gistId,
        headers: {'Authorization': 'token ' + part1 + part2}
      });
    };

    this.createNewGist = function(newGist) {
      return $http.post('https://api.github.com/gists', newGist, {
        headers: { 'Authorization': 'token ' + part1 + part2 }
      });
    };

    this.updateGist = function (newGist, gistId) {
      return $http.patch('https://api.github.com/gists/' + gistId, newGist, {
        headers: { 'Authorization': 'token ' + part1 + part2 }
      });
    };

    this.deleteGist = function (gistId) {
      return $http.delete('https://api.github.com/gists/' + gistId, {
        headers: { 'Authorization': 'token ' + part1 + part2 }
      });
    };
  });

  app.controller('GistListController', function($scope, dataService) {
    $scope.msg = 'GistListController hears you';
    dataService.getGistList().then(function(dataResponse) {
      $scope.gist = dataResponse;
    });
  });

  app.controller('GistController', function ($scope, $routeParams, dataService) {
    $scope.msg = 'OHAI!';
    dataService.getGistData($routeParams.g_id).then(function(dataResponse) {
      $scope.gist = dataResponse.data; 
    });
  });

  app.controller('GistDeleteController', function ($scope, $routeParams, dataService, $location) {
    $scope.msg = 'I is here!';
    dataService.deleteGist($routeParams.g_id).then(function(dataResponse) {
      $location.path("/");
    });
  });

  app.controller("GistFormController", ['$scope', "dataService", "$routeParams", "$location", function ($scope, dataService, $routeParams, $location) {

    $scope.saveNew = saveNewForm;
    $scope.saveEdits = saveEditsForm;

    $scope.gist = {};

    initialize();

    function initialize () {
      newGist = {};
      $scope.gist.files = {};
      if ($routeParams.g_id) {
        dataService.getGistData($routeParams.g_id).then(function (resp) {
          $scope.gist = resp.data;
        });
      }
    }

    function saveNewForm () {
      // newGist = {};
      var filename = document.getElementById('filename').value;
      var content1 = document.getElementById('content1').value;
      $scope.gist.description = document.getElementById('description').value;
      $scope.gist.files = {};
      $scope.gist.files[filename] = {content: content1, filename: filename + '.txt'}; 
      newGist = {
        "description": $scope.gist.description,
        "public": true,
        "files": $scope.gist.files
      };
      var method = $routeParams.g_id ? "updateGist" : "createNewGist";
      dataService[method](newGist, $routeParams.g_id).then(function (resp) {
        $location.path("/detail/" + resp.data.id);
      });
    }

    function saveEditsForm () {
      newGist = $scope.gist;
      var filename = document.getElementById('filename').value;
      $scope.gist.content = document.getElementById('content').value;
      console.dir($scope.gist.files);
      for (var file in $scope.gist.files) {
        console.dir(file["content"]);
        file = {content: $scope.gist.content, filename: filename};
      }
      $scope.gist.files[filename] = {content: $scope.gist.content, filename: filename};
      newGist = {
        "description": $scope.gist.description,
        "public": true,
        "files": $scope.gist.files
      };
      var method = $routeParams.g_id ? "updateGist" : "createNewGist";
      dataService[method](newGist, $routeParams.g_id).then(function (resp) {
        $location.path("/detail/" + $routeParams.g_id);
      });
    }
  }]);
})();
