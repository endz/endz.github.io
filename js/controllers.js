app.controller('mainController',
           ['$scope','$stateParams','$location','$window','$rootScope','$filter','$modal','hotkeys','toaster','cfpLoadingBar','GitHub',
    function($scope,  $stateParams,  $location,  $window,  $rootScope,  $filter,  $modal,  hotkeys,  toaster,  cfpLoadingBar,  GitHub){
    
    //show loading text on startup
    $scope.markdown='#Loading...';
       
    /*****************************************
        Set up the markdown editor
    ******************************************/
    $scope.edit = false;                        // set edit to false on startup (hide editor!)
    $scope.editorOptions = {                    // set codemirror options
        mode: 'text/x-markdown',
        theme:'default',
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        indentWithTabs: true,
        extraKeys: {
          "Ctrl-S": function (instance) {       // add save shortcut to codemirror editor
             $scope.savePost();
             return false;
          },
          "Cmd-S": function (instance) {       // add save shortcut to codemirror editor (mac)
             $scope.savePost();
             return false;
          },
          "Ctrl-E": function (instance) {       // add edit shortcut to codemirror editor
             $scope.edit=!$scope.edit;
             //TODO: create a focus directive (use tabIndex="-1")
             window.document.getElementsByClassName('rightPanel')[0].focus();
             return false;
          },
          "Cmd-E": function (instance) {       // add edit shortcut to codemirror editor
             $scope.edit=!$scope.edit;
             //TODO: create a focus directive (use tabIndex="-1")
             window.document.getElementsByClassName('rightPanel')[0].focus();
             return false;
          },
          "Ctrl-M": function (instance) {       // add new post shortcut to codemirror editor
             $scope.newPost();
             return false;
          },
          "Cmd-M": function (instance) {       // add new post shortcut to codemirror editor
             $scope.newPost();
             return false;
          },
        },
        onLoad: function(_editor){              // When the editor loads it NEEDS to have text/markdown
            $scope.editor = _editor;
            $scope.html = $window.marked($scope.markdown);
            
            $scope.editor.on("keyup", function(e) { // as we type/move... scroll html view to the new content
              // TODO: Change to key UP/DOWN only ?   
              $scope.editorCurPos = e.getCursor().line +1;
              $scope.editorHeight = e.doc.height;
              //$scope.editorNumLines= e.doc.size;
              //$scope.scrollFactor = $scope.editorCurPos / $scope.editorNumLines;
              
              $scope.$apply(); // needs to be updated

              // TODO: look at using $uiViewScroll !!!
              //window.scrollTo(0,($scope.editorHeight/15)*$scope.editorCurPos);
            });
        },
    };


    /*****************************************
        Set up ChiefFancyPants hotkeys
    ******************************************/
    hotkeys.bindTo($scope)
      .add({
        combo: 'mod+e',
        description: 'Open editor',
        callback: function(event) {
            event.preventDefault();
            if( $location.path().indexOf('/post' ) != -1 ) { $scope.edit=!$scope.edit; }
            else { toaster.pop("warning", "Oops", "Can't edit archive!"); }
            //TODO: create a directive to set editor focus
            setTimeout(function(){$scope.editor.focus();$scope.editor.refresh();}, 120);
        }
    }).add({
        combo: 'mod+s',
        description: 'Save changes',
        callback: function(event) {
            event.preventDefault();
            if( $location.path().indexOf('/post' ) != -1 ) { $scope.savePost(); }
            else { $scope.modalPrompt();  }
        }
    }).add({
        combo: 'mod+m',
        description: 'New post',
        callback: function(event) {
            event.preventDefault();
            $scope.newPost();
        }
    }).add({
        combo: 'mod+d',
        description: 'Delete post',
        callback: function(event) {
            event.preventDefault();
            $scope.deletePost();
        }
    }).add({
        combo: 'return',
        description: 'Select post',
        callback: function(event) {
            event.preventDefault();
            // save in archive to upload to github
            if(typeof modalForm !== 'undefined' && modalForm !== null){
                document.querySelector('#modalForm').submit();
            }
            // save anywhere else just saves to posts array
            else if( $location.path() == '/') {
                $scope.updateFiteredList();
                // select the post based on the position of the filtered list
                $scope.selectPost($scope.filteredItems[$scope.position].title);
            }
        }
    }).add({
        combo: 'backspace',
        description: 'Blog archive',
        callback: function(event) {
            event.preventDefault();
            $location.path('/');
            $scope.edit = false;
        }
    }).add({
        combo: 'up',
        description: 'Prev post',
        callback: function(event) {
            if( $location.path() == '/' ) {
                event.preventDefault();
                //if at top of visible list AND NOT at start of list
                if($scope.position === 0 && $scope.start>0){
                    $scope.start--;
                }
                if($scope.position!==0){
                        $scope.position--;
                }
                $scope.updateFiteredList();
            }
        }
    }).add({
        combo: 'down',
        description: 'Next post',
        callback: function(event) {
            if( $location.path() == '/' ) {
                event.preventDefault();
                //TODO: How long is a piece of ng-repeat...
                // what if we are at bottom of visible list but NOT at end of list...?
                if($scope.position == $scope.numPosts-1 && $scope.start<($scope.archive.length-$scope.numPosts)){
                    $scope.start++;
                }
                if($scope.position!=$scope.numPosts-1 ){
                        $scope.position++;
                }
                $scope.updateFiteredList();
            }
        }
    });



    /*****************************************
        Helper functions
    ******************************************/

    // get username from window.location
    $scope.username = $window.location.hostname.contains('github') ? $window.location.hostname.split('.')[0]: 'endz';
    // get blog settings & posts
    GitHub.getData($scope.username).then(function(data){
            $scope.archive = data[0].archive;
            $scope.settings = data[0].settings;
            $scope.contentLoaded = true;
            // if blog owner deetails are empty use github account details
            if(data[0].settings.authorName===''){
                GitHub.getUser($scope.username).then(function(data){
                    $scope.settings.authorName = data.login.charAt(0).toUpperCase()+data.login.slice(1); //capitlize 
                    $scope.settings.authorImg = data.avatar_url;
                    $scope.settings.authorBio = data.bio;
                });
            }
        }
    );
    $scope.savePost = function(){                               // When Ctrl+s is chosen save the data
        //TODO: FIX this crap

        var newPostObj={}, oldPostObj={};
        var newTitle, oldTitle, description;                    // find and set title + description

        newTitle = $scope.markdown.split('\n')[0].replace('#','');
        oldTitle = $stateParams.title;

        if(oldTitle === ''){                                    // create new post object!
            //create new post object
            newPostObj.title=newTitle;
            newPostObj.description=$scope.markdown.split('\n')[1].split('#').join('');      //TODO: Needs work!
            newPostObj.date=new Date();
            newPostObj.tags=$scope.markdown.split('\n')[2].split('#').join('').split(',');  //TODO: Needs work!
            newPostObj.postData=$scope.markdown;
            if($scope.archive.indexOf($filter('filter')($scope.archive, {title: newTitle}, false)[0])==-1){
                $scope.archive.push(newPostObj);
                $location.path('/post/'+newTitle);
                toaster.pop("info", "Saved", "New post has been saved!");
            }
            else
                toaster.pop("info", "Oops...", "A post already has that title!");
        }
        else if(newTitle !== oldTitle){                         // update old post object!
            //use new title to save over old title
            oldPostObj = $filter('filter')($scope.archive, {title: oldTitle}, true)[0];
            newPostObj.title=newTitle;
            newPostObj.description=$scope.markdown.split('\n')[1].split('#').join('');      //TODO: Needs work!
            newPostObj.date = oldPostObj.date;
            newPostObj.tags = oldPostObj.tags;
            newPostObj.postData=$scope.markdown;
            $scope.archive[$scope.archive.indexOf($filter('filter')($scope.archive, {title: oldTitle}, false)[0])]=newPostObj;
            toaster.pop("info", "Saved", "Old post has been post!");
        }
        else{                                                   // just save... ???         //TODO: NOT FINISHED
            $scope.archive[$scope.archive.indexOf($filter('filter')($scope.archive, {title: oldTitle}, false)[0])].postData=$scope.markdown;
            toaster.pop("info", "Saved", "Post markdown has been saved/updated!");
        }
    };
    $scope.newPost = function(title){
        
        $scope.markdown = "#Example post "+($scope.archive.length+1)+"\n####Example description\n#####Tag1,Tag2,Tag3\n\n##Getting started\nPress `Ctrl+e` or `Cmd+e` and start typing!  \nPress `Ctrl+s` or `Cmd+s` to save  \nPress `Ctrl+m` or `Cmd+m` to create a new post  \nPress `Backspace` to go back to archive  \n\nPress `?` to view shortcuts/hotkeys";
        $scope.html = $window.marked($scope.markdown);
        setTimeout(function(){  //prevent digest error
            $scope.editor.getDoc().setValue($scope.markdown);
        },100);
        $location.path('/post/');
        //$scope.$apply();                                        // make sure angular knows path has changed....
    };
    $scope.deletePost = function(){
        if($location.path()!=='/'){                             // Not great needs more work/thought! (RE: archive)
            var title = $scope.markdown.split('\n')[0].replace('#','');
            $scope.archive.splice($scope.archive.indexOf($filter('filter')($scope.archive, {title: title}, false)[0]), 1);
            $location.path('/');
        }
    };
    $scope.updatePost   = function(){                           // fired by: codemirror directive (ngChange in archive partial)
        $scope.markdown = $scope.editor.getDoc().getValue();
        $scope.html     = $window.marked($scope.markdown);
    };
    $scope.selectPost = function(title) {                       // fired from archive & from within this controller
        $location.path('/post/' + title);
    };
    $scope.updateFiteredList = function(){
        // get the data like it is in the view (filtered!)
        $scope.filteredItems = $filter('orderBy')($scope.archive, 'date',true);
        $scope.filteredItems = $filter('postFilter')($scope.filteredItems, $scope.start, $scope.numPosts);
    };
    
    // user prompts for login/upload/etc
    $scope.modalPrompt = function(){
        $rootScope.json = '[{"settings": '+angular.toJson($scope.settings) + ',"archive":' +angular.toJson($scope.archive) + '}]';
        $modal.open({
            templateUrl: 'partials/modal.html',
            controller: function($scope){
                $scope.submit = function(modalForm) {
                   //get sha of the file we want to overwrite
                   GitHub.getRepoContents(modalForm.username, 'data.json').then(function(fileInfo){
                        // Once we have the sha of the file... save new file
                        GitHub.saveData(modalForm.username, modalForm.password, $rootScope.json, fileInfo.sha).then(function(data) {
                            if(data.message)
                                toaster.pop("warning", "Error saving archive...", data.message);
                            else if(data.content)
                                toaster.pop("info", "Success", "Saved blog archive");
                        });
                    });
                };
            }
        });
        setTimeout(function(){
            document.querySelector('#username').focus();
        }, 100);
    };
    
    /*****************************************
        Watch which post to load
    ******************************************/
    $rootScope.$on('$stateChangeSuccess',
        function(event, newState, newParams, prevState, prevParams){
            
            $scope.edit = false;//close the editor
            setTimeout(function(){
                // needs to be more accurate....
                if(newParams.title){
                    // find post
                    var found = $filter('filter')($scope.archive, {title: newParams.title}, true);
                     if (found.length) {
                        $scope.markdown=found[0].postData;
                        $scope.html=$window.marked($scope.markdown);
                        $scope.editor.getDoc().setValue($scope.markdown);
                     } else {
                        $location.path('/404');
                    }
                }
            }, 100);
    });
    
    /*****************************************
        Archive view settings
    ******************************************/
    //TODO: determine numPosts to be displayed based on window height 
    $scope.numPosts  = 4; // posts to display   
    $scope.position  = 0; // post to highlight  
    $scope.start     = 0; // show posts starting from x - x + numPosts-1
}]);


app.controller('disqusController', ['$scope', '$location', function($scope, $location){
    // check that all required settings are available
    $scope.disqusActive = $location.$$absUrl.indexOf('!')>-1; //only if hashPrefix mode is active
    $scope.disqusActive = $scope.settings.disqusUrl!=='';
    $scope.disqusActive = $scope.settings.disqusName!=='';

    var path = $location.path().split(' ').join('-');       //path cant have spaces
    path = path.split('%20').join('-');                     //path cant have url encoded spaces
    
    if($location.path() !== '/post/' ){                          //prevent comments on new post page ("/post/")
        $scope.disqusShortname=$scope.settings.disqusName;      //discuss username/shortname
        $scope.disqusUrl= $scope.settings.disqusUrl+path;       //must configure allowed url! + current path
        $scope.disqusId =  path;                                //unique post id...
        $scope.contentLoaded = true;                          //it should load the Disqus widget if data loaded
    }
    else
        $scope.contentLoaded = false;
}]);
