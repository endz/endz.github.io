app.factory('GitHub', ['$q', '$http', function($q, $http) {
    var API ='https://api.github.com/';
    
    return {
        getUser : function(user) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: API+'users/'+user,
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).error(function(err){console.log(err);});
            return deferred.promise;
        },
        getRepos : function(user){
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: API+'users/'+user+'/repos',
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).error(function(err){ deferred.resolve(err);});
            return deferred.promise;
        },
        //GET /repos/:owner/:repo/contents/:path
        getRepoContents : function(user, file){
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: API+'repos/'+user+'/'+user+'.github.io/contents/'+file,
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).error(function(err){ deferred.resolve(err);});
            return deferred.promise;
        },
        getData : function(user) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: 'data.json',
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).error(function(err){deferred.resolve(err);});
            return deferred.promise;
        },

        //TODO: check if file already exists first!!!
        saveData : function(user, pass, data, sha){
            var deferred = $q.defer();
            $http({
                method: 'PUT',
                url: API+'repos/'+user+'/'+user+'.github.io/contents/data.json',
                headers: {
                    'Accept':'application/vnd.github.v3.raw+json',
                    'Content-Type':'application/json;charset=UTF-8',
                    'User-Agent':'firefox',
                    'Authorization': 'Basic '+btoa(user+':'+pass),
                },
                data: {
                    'path': 'data.json',
                    'message': 'Test Commit',
                    /*'committer': {
                        "name": user,
                        'email': '<email>'
                    },*/
                    'content': btoa(data),
                    'sha': sha ? sha : '',
                    //'branch': 'master'
                }
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).error(function(err){
                deferred.resolve(err);
            });
            return deferred.promise;
        }

    };
    
}]);