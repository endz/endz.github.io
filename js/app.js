app = angular.module('app', ['ui.bootstrap','ui.router', 'chieffancypants.loadingBar', 'ngAnimate', 'cfp.hotkeys', 'toaster', 'ui.codemirror', 'angularUtils.directives.dirDisqus']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function( $stateProvider, $urlRouterProvider, $locationProvider) {
    // use hashPrefix for disqus comments!
    $locationProvider.hashPrefix('!');

    var blogPath = '/';
    $urlRouterProvider.otherwise(blogPath);

    $stateProvider
        //parent state
        .state('blog', {
          abstract: true,
          views: {
            "profileView" : {
                templateUrl: 'partials/profileView.html',
            },
            "markupEdit"  : {
                templateUrl: 'partials/markupView.html',
            },
          }
        })
        .state('blog.archive',{
            url: blogPath,
            views: {
                "htmlView@": {
                    templateUrl: 'partials/archiveView.html',
                }
            }
        })
        .state('blog.post',{
            url: blogPath+'post/:title',
            views: {
                "htmlView@": {
                    templateUrl: 'partials/htmlView.html',
                }
            },
        })
        .state('blog.error',{
            url: blogPath+'404',
            views: {
                "htmlView@": {
                    templateUrl: 'partials/404.html',
                }
            },
        });
}]);