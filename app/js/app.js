'use strict';

var App = angular.module('App',['ngRoute',"chart.js"]);


App.factory('myHttpInterceptor', function($rootScope, $q) {
  return {
    'requestError': function(config) {
      $rootScope.status = 'HTTP REQUEST ERROR ' + config;
      return config || $q.when(config);
    },
    'responseError': function(rejection) {
      $rootScope.status = 'HTTP RESPONSE ERROR ' + rejection.status + '\n' +
                          rejection.data;
      return $q.reject(rejection);
    },
  };
});

App.factory('simulationService', function($rootScope, $http, $q, $log) {
  $rootScope.status = 'Retrieving data...';
  var deferred = $q.defer();
  $http.get('rest/query')
  .success(function(data, status, headers, config) {
    $rootScope.simulations = data;
    deferred.resolve();
    $rootScope.status = '';
  });
  return deferred.promise;
});



App.config(function($routeProvider) {
  $routeProvider.when('/launchsimulation', {
    controller : 'LaunchSimulation',
    templateUrl: '/partials/main.html',
    resolve    : { 'simulationService': 'simulationService' },
  });
  $routeProvider.when('/statistics', {
    controller : 'StatisticsCtrl',
    templateUrl: '/partials/statistics.html',
      resolve: {
            datistatistiche: function(myService){
                return myService.get();
        }
    }
  });
  $routeProvider.otherwise({
    redirectTo : '/launchsimulation'
  });
});

App.config(function($httpProvider) {
  $httpProvider.interceptors.push('myHttpInterceptor');
});


App.controller('LaunchSimulation', function($scope, $rootScope, $log, $http, $routeParams, $location, $route,$q,myService) {

  $scope.startSimulation = function() {

    $rootScope.status = 'Starting simulation...';
    $http.post('/rest/start')
    .success(function(data, status, headers, config) {
      $rootScope.simulations.push(data);
      $rootScope.status = '';
    });
    $location.path('/');
  }

  $scope.deleteAllSimulations = function() {

    $rootScope.status = 'Deleting numbers...';
    $http.post('/rest/deletenumbers')
    .success(function(data, status, headers, config) {
      $rootScope.simulations = [];
      $rootScope.status = 'All simulations are deleted';
    });
    $location.path('/launchsimulation');
  }




$scope.goToStatistics = function(id) {

    $rootScope.status = 'Get statistic simulation ' + id + '...';
    $http.post('rest/getstatistics', {'idsimulation': id})
    .success(function(data, status, headers, config) {
      $rootScope.statistiche=data;
      myService.set(data);
      $rootScope.status = '';
         $location.path('/statistics');
    });
    //$location.path('/statistics');
  }

 $scope.goToStatistics2 = function (id) {

console.log(id);

   $rootScope.status = 'Get statistic simulation ' + id + '...';
  var deferred = $q.defer();
  $http.post('rest/getstatistics', {'idsimulation': id})
  .success(function(data, status, headers, config) {
    $rootScope.statistiche=data;
    myService.set(data);
    deferred.resolve();
    $rootScope.status = '';
  });
   $location.path('/statistics');
  return deferred.promise;


  };

});



App.factory('myService', function($rootScope, $http, $q, $log) {
 var savedData = {}
 function set(data) {
   savedData = data;

 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

});


App.controller('LoginCtrl', function($scope, $rootScope, $log, $http, $routeParams, $location, $route, statistiche) {
  $scope.goToPage = function () {
    $location.path('/launchsimulation');
  }


});



App.controller('StatisticsCtrl', function($scope, $rootScope, $log, $http, $routeParams, $location, $route,myService, datistatistiche) {

 //$scope.arrayPercentuale050=[];
 $scope.retrivedStatistics =  datistatistiche;
    var FirstCol1numbers=[];
    var Firstcol2percent=[];

    var Secondcol1numbers=[];
    var Secondcol2percent=[];

    if(angular.isDefined($scope.retrivedStatistics.percentale050)){
        FirstCol1numbers = $scope.retrivedStatistics.percentale050.map(function(value,index) { return value[0]; });
        Firstcol2percent = $scope.retrivedStatistics.percentale050.map(function(value,index) { return value[1]; });
     }

     if(angular.isDefined($scope.retrivedStatistics.percentale050)){
        Secondcol1numbers = $scope.retrivedStatistics.extractedNumberPercent.map(function(value,index) { return value[0]; });
        Secondcol2percent = $scope.retrivedStatistics.extractedNumberPercent.map(function(value,index) { return value[1]; });
     }


    // if(angular.isDefined($scope.retrivedStatistics.percentale050)){
    //     var roots1 = $scope.retrivedStatistics.percentale050.map(function(value,index) { return value[0]; });
    // console.log("prova1");
    // }



    //$scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    // $scope.data = [
    //   [65, 59, 80, 81, 56, 55, 40]
    // ];

    //Dati primo grafico
    $scope.labels = FirstCol1numbers;
    $scope.series = ['Series A'];
    $scope.data = [Firstcol2percent];

    //Dati secondo grafico
     $scope.labels2 = Secondcol1numbers;
     $scope.series2 = ['Series A'];
     $scope.data2 = [Secondcol2percent];






  $scope.goToLaunchSimulation = function () {
    $location.path('/launchsimulation');
  }


});

