
//http://stackoverflow.com/questions/18157305/angularjs-compiling-dynamic-html-strings-from-database
app.directive('dynamic', function ($compile, $window) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, element, attrs) {
        
        scope.$watch(attrs.dynamic, function(html) {
    
            element.html(html);
            //set minimum post height so that disqus comments are at the bottom of the page...
            var style = 'min-height: '+($window.outerHeight - 380)+'px;';
            element.attr('style', style);
            $compile(element.contents())(scope);
        });
    }
  };
});

app.directive('pre', [function () {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            //get description for code (format: code-language-description)
            var description = element[0].children[0].attributes[0].value.split(':')[1];
            if(description)
                element.after('<div class="caption" style="margin-bottom: 30px;"><b>Fig 1.1 </b> '+description+'</div>');
            //add line numbers attr
            element.attr('line-numbers', '');
            
            Prism.highlightElement(element[0].children[0]);
        }
    };
}]);

app.directive('img', [function () {
    return {
        restrict: 'E',
        replace: true,
        //transclude: true,
        link: function(scope, element, attrs) {
            //catch link errors
            element.bind('error', function () {
                angular.element(this).attr('src', 'http://placehold.it/1860x600');
            });
            //style image as photo/tumbnail
            element.attr('class', 'img-responsive  thumbnail');
            //get & set description for image
            var description = element[0].title;
            if(description)
                element.parent().append('<div class="caption" style="margin-top:-12px; margin-bottom: 30px;"><b>Fig 1.1 </b> '+description+'</div>');
            //TODO: number images

        },
    };
}]);