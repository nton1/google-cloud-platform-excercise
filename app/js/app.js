'use strict';

var App = angular.module('App',['ngRoute',"chart.js","angular-google-gapi"]);



App.run(['GAuth', 'GApi', 'GData','$location', '$rootScope',
    function(GAuth, GApi, GData, $location, $rootScope) {

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
   GAuth.checkAuth().then(
            function (user) {
                console.log(user.name + 'is login')

            },
            function() {

                 if($rootScope.userLoggedIn==='revevol'){
                    console.log($rootScope.userLoggedIn + 'is logged in')

                 }else{
                     console.log('No user logged in')
                     $location.path('/login');
                 }

            }
        );
  });

        $rootScope.gdata = GData;

        //var CLIENT = 'yourGoogleAuthAPIKey';
        var CLIENT = '868258554719-th81m4ers5j7779tuc817rs37rqra6j7.apps.googleusercontent.com';
        //var BASE = 'https://myGoogleAppEngine.appspot.com/_ah/api';
        //var BASE = 'https://accounts.google.com/o/oauth2/auth';
        var BASE = 'https://apis.google.com/js/platform.js';

        GApi.load('myApiName','v1',BASE);
        //GApi.load('calendar','v3'); // for google api (https://developers.google.com/apis-explorer/)

        GAuth.setClient(CLIENT);
        GAuth.setScope("https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email "); // default scope is only https://www.googleapis.com/auth/userinfo.email

    // load the auth api so that it doesn't have to be loaded asynchronously
    // when the user clicks the 'login' button.
    // That would lead to popup blockers blocking the auth window
    GAuth.load();

    // or just call checkAuth, which in turn does load the oauth api.
    // if you do that, GAuth.load(); is unnecessary
        GAuth.checkAuth().then(
            function (user) {
                console.log(user.name + 'is login')
                //$state.go('webapp.home');
                $location.path('/');
                // an example of action if it's possible to
                              // authenticate user at startup of the application
            },
            function() {
                console.log('No user logged in')
                 if($rootScope.userLoggedIn==='revevol'){

                 }else{
                     $location.path('/login');
                 }

                //$state.go('login');       // an example of action if it's impossible to
                      // authenticate user at startup of the application
            }
        );
    }
]);


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


App.factory('checkUserLoggedIn', function(GAuth,$location) {
     GAuth.checkAuth().then(
            function (user) {
                console.log(user.name + 'is login')
                //$state.go('webapp.home');
                $location.path('/launchsimulation');

            },
            function() {
                if($rootScope.userLoggedIn==='revevol'){
                    console.log($rootScope.userLoggedIn + 'is logged in')
                    $location.path('/launchsimulation');
                 }else{
                     console.log('No user logged in')
                     $location.path('/login');
                 }
            }
        );

});



App.config(function($routeProvider) {
  $routeProvider.when('/login', {
    controller : 'LoginCtrl',
    templateUrl: '/partials/login.html'
  });
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


App.controller('LaunchSimulation', function($scope, $rootScope, $log, $http, $routeParams, $location, $route,$q,myService,GAuth) {

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


  $scope.doLogOut = function() {
            GAuth.logout().then(function(){

                $http.post('https://mail.google.com/mail/u/0/?logout&hl=en')
  .success(function(data, status, headers, config) {
   $location.path('/login');
  });
                //window.location = "https://mail.google.com/mail/u/0/?logout&hl=en";
                //$location.path('/login');
            }, function() {
                console.log('logout failed');
            });

        if($rootScope.userLoggedIn==='revevol') {
            $rootScope.userLoggedIn = '';
            $rootScope.loginFailed = '';
            $location.path('/login');
        }

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


App.controller('LoginCtrl', function($scope, $rootScope, $log, $http, $routeParams, $location, GAuth) {


     $scope.doSingup = function() {
            GAuth.login().then(function(user){

                console.log(user.name + ' is login');
                console.log(user);

                GAuth.getToken().then(function (data) {
                     var id_token = data.id_token;
                      console.log("ID Token: " + id_token);
                      $location.path('/');
                 }, function () {
                     console.log('token retrive failed ');
                 });

                //$state.go('webapp.home'); // action after the user have validated that
                          // your application can access their Google account.
            }, function() {
                console.log('login fail');
            });
      };


      $scope.loginUser = function(form) {
          var url = form;
          console.log(url);

    $http.post('rest/login', { email: $scope.email, password: $scope.password })
    .success(function(data, status, headers, config) {
      $rootScope.userLoggedIn=data.user;
        if($rootScope.userLoggedIn==='revevol'){
            $rootScope.loginFailed="";
         $location.path('/launchsimulation');
        }else{
            $rootScope.loginFailed="Login fallita, inserire email e password corretti";
            $location.path('/login');
        }
    });
    //$location.path('/statistics');
  }





  $scope.goToPage = function () {
    $location.path('/launchsimulation');
  }


});



App.controller('StatisticsCtrl', function($scope, $rootScope, $log, $http, $routeParams, $location, $route,myService, datistatistiche,GAuth) {

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



$scope.doLogOut = function() {
            GAuth.logout().then(function(){

                $http.post('https://mail.google.com/mail/u/0/?logout&hl=en')
  .success(function(data, status, headers, config) {
   $location.path('/login');
  });
                //window.location = "https://mail.google.com/mail/u/0/?logout&hl=en";
                //$location.path('/login');
            }, function() {
                console.log('logout failed');
            });

        if($rootScope.userLoggedIn==='revevol') {
            $rootScope.userLoggedIn = '';
            $rootScope.loginFailed = '';
            $location.path('/login');
        }

      };


  $scope.goToLaunchSimulation = function () {
    $location.path('/launchsimulation');
  }


});

