/*
Filter descriptions

offset : Limit the number of posts in archiveView???
*/

app.filter('postFilter', function(){
  return function(posts, start, end){
  	return posts.slice(start, start+end);
  };
});
