/**
 * Created by sanek on 28.12.13.
 */
(function application (window) {
    angular.module('sVSs', [ 'ngSanitize', 'ngRoute', 'socketService'])
        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
            $routeProvider.when('/register',{ templateUrl:'html/register.html', controller: 'RegisterCtrl'})
                .when('/login',{ templateUrl:'html/login.html', controller: 'LoginCtrl'})
//                .when('/',{ templateUrl:'html/index.html', controller: 'HomeCtrl'})
                .otherwise({template : '<div ng-bind-html="Page.body"></div>', controller: 'PageCtrl'});

            function exampleInterceptor($q,$log) {
                function success(response) {
                    $log.info('Successful response:' + response);
                    return response;
                }
                function error(response) {
                    var status = response.status;
                    $log.error('Response status: ' + status + '.' + response);
                    return $q.reject(response); //similar to throw response;
                }
                return function(promise) {
                    return promise.then(success, error);
                }
            }
            $httpProvider.responseInterceptors.push(exampleInterceptor);


        }]).run(['$rootScope', '$location', function ($rootScope, $location) {

            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                $rootScope.error = null;
            });

        }]);

    angular.module('sVSs').controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$window', '$route', function($rootScope, $scope, $http, $window, $route) {

        $scope.login = function() {
            var payload = 'email=' + $scope.email+'&password='+$scope.password+'&stayOnline=' + $scope.stayOnline;
            var config = {
                headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
            }
            $http.post('/login', payload, config).success(function(socket) {
                $route.reload();
                console.log(socket);

            }).error(function(err) {
                $rootScope.error = err;
            });
        }

    }]);
    angular.module('sVSs').controller('RegisterCtrl', ['$rootScope', '$scope', '$http', '$location', '$route', function($rootScope, $scope, $http, $location, $route) {

        $scope.register = function() {
            console.log($scope.email);
            var payload = 'email=' + $scope.email+'&password='+$scope.password+'&confirmationPassword='+$scope.confirmationPassword;
            var config = {
                headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
            }
            $http.post('/registration', payload, config).success(function(socket) {
                console.log(socket);
                $rootScope.error = 'Check your email for activate account!!';

            }).error(function(err) {
                $rootScope.error = err;
                console.log(err);
            });
        }

    }]);
    angular.module('sVSs').controller('ForgotCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        $scope.forgot = function() {
            console.log($scope.email);
            var payload = 'email=' + $scope.email+'&password='+$scope.password+'&confirmationpassword='+$scope.confirmationpassword;
            var config = {
                headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
            }
            $http.post('/forgot', payload, config).success(function(socket) {
                console.log(socket);
                $rootScope.error = 'Check your email for activate account!!';

            }).error(function(err) {
                $rootScope.error = err;
                console.log(err);
            });
        }

    }]);
    angular.module('sVSs').controller('MainCtrl', ['$rootScope', '$scope', '$http', '$location', 'socket', function($rootScope, $scope, $http, $location, socket) {
        console.log($location.path() || '/');

        $scope.form = 'login';
        $scope.setForm = function(str) {
            $scope.form = str;
        }
    }]);
    angular.module('sVSs').controller('PageCtrl', ['$rootScope', '$scope', '$http', '$location', 'socket', function($rootScope, $scope, $http, $location, socket) {
        console.log($location.path() || '/');
        $scope.form = true;
        function getTemplate() {
            socket.emit('getPage', $location.path() || '/', function(page) {
                console.log('pages');
                $scope.Page = page;
            });
        }
        getTemplate();

    }]);

    function checkRouting($q, $rootScope, socket) {
        if ($rootScope.userProfile) {
            return true;
        }
        //data.reconnect();
        var defered = $q.defer();
        // var session = getCookie('session');
        // console.log(session);
        socket.emit('getUser', 'session', function(user) {
            if (user) {
                $rootScope.userProfile = user;
                console.log($rootScope.userProfile);

                defered.resolve(true);
                //$rootScope.$apply();
            } else {
                console.log(user);
                defered.reject();
                window.location.href = '/';
                //$rootScope.$apply();
            }
        });
        return defered.promise;
    }

})(window)