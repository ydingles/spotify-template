var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query='
// 'firebase' dependency
var myApp = angular.module('myApp', ['firebase'])

// Bind controller
var myCtrl = myApp.controller('myCtrl', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject) {

  // Create a variable 'ref' to reference your firebase storage
  var refSpotify = new Firebase('https://myspotify.firebaseio.com/');

  // Create references to store tweets and users
  var usersRef = refSpotify.child("users");
  var songsRef = refSpotify.child("songs");

  // Create a firebaseObject of your users, and store this as part of $scope
  $scope.users = $firebaseObject(usersRef);

  // Create a firebaseArray of your songs, and store this as part of $scope
  $scope.songs = $firebaseArray(songsRef);    

  // Create authorization object that referes to firebase
  $scope.authObj = $firebaseAuth(refSpotify);

    // Test if already logged in
  var authData = $scope.authObj.$getAuth();
  if (authData) {
    $scope.userId = authData.uid;
  } 

  // SignUp function
  $scope.signUp = function() {
    // Create user
    $scope.authObj.$createUser({
      email: $scope.email,
      password: $scope.password,      
    })

    // Once the user is created, call the logIn function
    .then($scope.logIn)

    // Once logged in, set and save the user data
    .then(function(authData) {
      $scope.userId = authData.uid;
      $scope.users[authData.uid] ={
        username:$scope.username 
      }
      $scope.users.$save()
    })

    // Catch any errors
    .catch(function(error) {
      console.error("Error: ", error);
    });
  }

  // SignIn function
  $scope.signIn = function() {
    $scope.logIn().then(function(authData){
      $scope.userId = authData.uid;
    })
  }

  // LogIn function
  $scope.logIn = function() {
    console.log('log in')
    return $scope.authObj.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    })
  }

  // LogOut function
  $scope.logOut = function() {
    $scope.authObj.$unauth()
    $scope.userId = false
  }


  // Write an accesible songsave function to save a song
  $scope.songsave = function(track) {

    // Add a new object to the song array using the firebaseArray .$add method.     
    $scope.songs.$add({
      userId:$scope.userId, 
      song:track.name,
      artist:track.artists[0].name,
      image:track.album.images[2].url,
      play:track.preview_url,
      time:Firebase.ServerValue.TIMESTAMP
    })
  }

  // Write an accessible songremove function to remove a song
  $scope.songremove = function(track) {
    $scope.songs.$remove({
      song:null,
      artist:null,
      image:null,
      play:null,
      time:Firebase.ServerValue.TIMESTAMP
    })
  }

  // spotify audio
  $scope.audioObject = {}
  $scope.getSongs = function() {
    $http.get(baseUrl + $scope.track).success(function(response){
      data = $scope.tracks = response.tracks.items
      
    })
  }
  $scope.play = function(song) {
    if($scope.currentSong == song) {
      $scope.audioObject.pause()
      $scope.currentSong = false
      return
    }
    else {
      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
      $scope.audioObject = new Audio(song);
      $scope.audioObject.play()  
      $scope.currentSong = song
    }
  }

})

// Add tool tips to anything with a title property
$('body').tooltip({
    selector: '[title]'
});