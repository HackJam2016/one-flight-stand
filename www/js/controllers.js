angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $state, $ionicModal, System, UserService, TripService, $ionicPopup, $http) {
  // variables
  $scope.isBluetoothConnected = false;
  $scope.isMenuOpen = false;
  $scope.user = {email: 'cathay_pacific@gmail.com', password: '123456'};
  $scope.newUser = {email: 'cykwongaa@connect.ust.hk', password: '123456'};
  $scope.currentUser = {};

  $scope.trip = {
    "flight_number_to": "CX 755",
    "foreign_address": "アキタケン, アキタシ, ホドノ, 272-1097",
    "update_time": "2016-10-22T10:09:27.500811",
    "user_info": {},
    "create_time": "2016-10-22T10:09:27.500785",
    "from_date": null,
    "destination": null,
    "to_date": null,
    "owner": 5629499534213120,
    "uid": 5891733057437696,
    "flight_number_back": null,
    "last_visit_country": null,
    "next_visit_country": null
  };

  $scope.showLogin = true;
  $scope.isLogin = false;
  $scope.modalTitle = "Login";
  $scope.country_list = [];

  // bluetoothSerial.available(function() {
  //   bluetoothSerial.enable(function() {
  //     bluetoothSerial.connect('', function() {
  //       console.log("successfully connected bluetooth!");
  //     }, function() {
  //       console.log("Error in connecting bluetooth!");
  //     });
  //     console.log("Bluetooth enabled!");
  //   }, function() {
  //     console.log("Bluetooth cannot enabled");
  //   });
  // },function() {
  //   console.log("Bluetooth are not available!");
  // });

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.navigateTo = function(state) {
    $state.go(state);
  };

  $scope.changeTo = function(title) {
    $scope.modalTitle = title;
    if (title === 'Login')
      $scope.showLogin = true;
    else
      $scope.showLogin = false;
  };

  $scope.login = function() {
    //console.log('$scope.login()');
    $scope.api_call = new System.login();

    $scope.params = $scope.user;

    //console.log($scope.params);

    System.showLoading();
    $scope.api_call.save($scope.params, function(response){
        System.hideLoading();
        //console.log(response);
        UserService.setUser(response);
        $scope.currentUser = response;
        $scope.trip.user_info = $scope.currentUser;
        System.setLogin();
        $scope.isLogin = true;
        $scope.modal.hide();
    });
  };

  $scope.signUp = function() {
    //console.log('$scope.signup()');
    $scope.api_call = new System.register();

    $scope.params = $scope.newUser;

    System.showLoading();
    $scope.api_call.save($scope.params, function(response){
        System.hideLoading();
        //console.log(response);
        UserService.setUser(response);
        $scope.user = $scope.newUser;
        $scope.login();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'User is registered!'
        }).then(function(res) {

        });
    });
  };

  $scope.searchBluetooth = function() {
    angular.element(document.getElementsByClassName('search-profile')).css('-webkit-animation', 'avatar 0.8s');
    $scope.isBluetoothConnected = true;
  };
})

.controller('ImmigrationCtrl', function($scope, TripService, UserService, System, $http, $ionicHistory, $ionicPopup, $ionicModal) {
  $scope.from_date = "2016-11-10 12:00:00";
  $scope.to_date = "2016-11-11 23:00:00";
    
  $from_date = new Date("2016-11-10 12:00:00");
  $to_date = new Date("2016-11-11 23:00:00");
  $from_date = $from_date.getTime() / 1000;
  $to_date = $to_date.getTime() / 1000;

  $scope.data = {
    "title": 'Family Trip',
    "access_token": null,
    "flight_number_to": 'CX121',
    "foreign_address": 'Thailand',
    "update_time": "2016-10-22T10:09:27.500811",
    "user_info": UserService.getUser(),
    "create_time": "2016-10-22T10:09:27.500785",
    "destination": 'TH',
    "from_date": $from_date,
    "to_date": $to_date,
    "owner": 5629499534213120,
    "uid": 5891733057437696,
    "flight_number_back": 'CX123',
    "last_visit_country": 'HK',
    "next_visit_country": 'TH'
  };
  $scope.openForm = false;
  $scope.isLoading = false;
  $scope.qrcode_string = 'www.acesobee.com';
  $scope.size = 250;
  $scope.correctionLevel = '';
  $scope.typeNumber = 0;
  $scope.inputMode = '';
  $scope.image = true;

  $scope.trip_list_data = [];
  $scope.isLogin = System.getIsLogin();

  $scope.init = function () {
      if($scope.isLogin)
          $scope.getTripList();
  }

  $scope.setTrip = function () {

    if(!$scope.isLogin){
        return;
    }

    $scope.trip = $scope.data;
    if($scope.isLogin){
        //$scope.trip.user_info = UserService.getUser();

        var params = {
            method: 'POST',
            url: 'http://cathay-pacific-146715.appspot.com/api/v1/trips',
            headers: {
                'X-WALKER-ACCESS-TOKEN': UserService.getUser().access_token
            },
            data: $scope.trip
        }
    }
    else{
        $scope.trip.user_info = {};
        //console.log($scope.trip.user_info);
        var params = {
            method: 'POST',
            url: 'http://cathay-pacific-146715.appspot.com/api/v1/trips',
            data: $scope.trip
        }
    }
    //console.log(params);

    $scope.isLoading = true;
    System.showLoading();
    $http(params).then(function(response){
        console.log(response.data);
        TripService.setTrip(response.data);
        //console.log(response);
        //console.log(response.data.access_token);
        if($scope.isLogin)
            $scope.getTripList();
        else
            $scope.trip_list_data.push(response.data);
        System.hideLoading();
        $scope.isLoading = false;
        $scope.openForm = false;
        
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Trip Record is created!'
        }).then(function(res) {

        });
        //$ionicHistory.goBack();
    }, function(response){
        //console.log(response);
    });
  }

  $scope.getTripList = function () {
    if(!$scope.isLogin){
        return;
    }
    var params = {
        method: 'GET',
        url: 'http://cathay-pacific-146715.appspot.com/api/v1/trips',
        headers: {
            'X-WALKER-ACCESS-TOKEN': UserService.getUser().access_token
        },
    }

    //console.log(params);
    $scope.isLoading = true;
    System.showLoading();
    $http(params).then(function(response){
        //console.log('getTripList:');
        //console.log(response);
        angular.forEach(response.data.results, function(data, index){
            //console.log(data.create_time.substr(0, 10));
            //console.log(data.create_time.substr(11, 8));
            data.temp_create_time = data.create_time.substr(0, 10) + ' ' + data.create_time.substr(11, 8);
            //console.log(data.temp_create_time);
        })
        $scope.trip_list_data = response.data.results;
        //console.log($scope.trip_list_data);
        System.hideLoading();
        $scope.isLoading = false;
    }, function(response){
        //console.log(response);
    });
  }

  $scope.getTrip = function (data) {
    $scope.temp_string = 'http://cathay-pacific-146715.appspot.com/trips/' + data.uid + '?access_token=' + data.access_token;

    var params = {
        method: 'POST',
        url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyC4fJd2cD8r4sQfTh8CccyzyoFXDT80glg',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            'longUrl': $scope.temp_string
        }
    }

    //console.log(params);
    $http(params).then(function(response){
        //console.log(response);
        $scope.qrcode_string = response.data.id;
    }, function(response){
        //console.log(response);
    });

    //$scope.qrcode_string = 'http://cathay-pacific-146715.appspot.com/trips/' + data.uid + '?access_token=' + data.access_token;
    $scope.openQRCode();
/*
    var params = {
        method: 'GET',
        url: 'http://cathay-pacific-146715.appspot.com/api/v1/trips/' + TripService.getTrip().uid + '?access_token=' + TripService.getTrip().access_token,
        headers: {
            'X-WALKER-ACCESS-TOKEN': UserService.getUser().access_token
        },
    }

    console.log(params);

    $http(params).then(function(response){
        console.log(response);
    }, function(response){
        console.log(response);
    });
*/
  };

  $scope.openQRCodeLink = function () {
      window.open($scope.qrcode_string);
  }

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation: 'fade-out'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openQRCode = function() {
    $scope.modal.show();
  };

  $scope.closeQRCode = function () {
    $scope.modal.hide();
  }

  $scope.checkFinished = function() {
    for(var key in $scope.data) {
      if (typeof $scope.data[key] === 'object') {
        for (var childKey in $scope.data[key]) {
          if ($scope.data[key][childKey] === undefined || $scope.data[key][childKey] === '' || $scope.data[key][childKey] === null)
            return true;
        }
      } else {
        if ($scope.data[key] === undefined || $scope.data[key] === '' || $scope.data[key] === null)
          return true;
      }
    }
    return false;
  };

  $scope.submitForm = function() {
      $scope.setTrip();
  }

  $scope.goBack = function() {
    if ($scope.openForm)
      $scope.destroyForm();
    else
      $ionicHistory.goBack();
  };

  $scope.destroyForm = function() {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Quit Immigration Paper',
       template: 'Are you sure you want to quit this form?'
     }).then(function(res) {
       if (res) {
         $scope.data = {};
         $scope.openForm = false;
       }
     });
  }

  $scope.createForm = function() {
    //console.log("data: ", $scope.data);
    if ($scope.openForm) {
      $scope.destroyForm();
    } else
      $scope.openForm = !$scope.openForm;
  }

})

.controller('ChatroomCtrl', function($scope) {})

.controller('CateringCtrl', function($scope) {})

.controller('NotificationCtrl', function($scope) {})

.controller('BlackboxCtrl', function($scope) {})

.controller('RedemptionCtrl', function($scope, $ionicHistory, $ionicPopup, $ionicModal) {
  $scope.openMall = false;

  $scope.startShopping = function() {
    $scope.openMall = !$scope.openMall;
  };

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };
})

.controller('DashCtrl', function($scope, $ionicHistory, $state, $ionicTabsDelegate) {
  $scope.openChat = false;

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
  $scope.viewChat = function() {
    $state.go('chats');
  }
  $scope.createChat = function() {
    //console.log("create chat", $scope.openChat);
    $scope.openChat = !$scope.openChat;
  }

  $scope.switchTab = function(index){
      $ionicTabsDelegate.select(index);
  }
})

.controller('ChatsCtrl', function($scope, $rootScope, $state, $stateParams, MockService, $ionicActionSheet, $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicHistory) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // mock acquiring data via $stateParams
    $scope.toUser = {
      _id: '534b8e5aaa5e7afc1b23e69b',
      pic: '../img/ben.png',
      username: 'Venkman'
    }

    // this could be on $rootScope rather than in $stateParams
    $scope.user = {
      _id: '534b8fb2aa5e7afc1b23e69c',
      pic: '../img/adam.jpg',
      username: 'Elvis Wong'
    };

    $scope.input = {
      message: localStorage['userMessage-' + $scope.toUser._id] || ''
    };

    $scope.messages = [[{
      "_id": "535d625f898df4e80e2a125e",
      "text": "Ionic has changed the game for hybrid app development.",
      "userId": "534b8fb2aa5e7afc1b23e69c",
      "date": "2014-04-27T20:02:39.082Z",
      "read": true,
      "readDate": "2014-12-01T06:27:37.944Z"
    }, {
      "_id": "535f13ffee3b2a68112b9fc0",
      "text": "I like Ionic better than ice cream!",
      "userId": "534b8e5aaa5e7afc1b23e69b",
      "date": "2014-04-29T02:52:47.706Z",
      "read": true,
      "readDate": "2014-12-01T06:27:37.944Z"
    }, {
      "_id": "546a5843fd4c5d581efa263a",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "userId": "534b8fb2aa5e7afc1b23e69c",
      "date": "2014-11-17T20:19:15.289Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.328Z"
    }, {
      "_id": "54764399ab43d1d4113abfd1",
      "text": "Am I dreaming?",
      "userId": "534b8e5aaa5e7afc1b23e69b",
      "date": "2014-11-26T21:18:17.591Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.337Z"
    }, {
      "_id": "547643aeab43d1d4113abfd2",
      "text": "Is this magic?",
      "userId": "534b8fb2aa5e7afc1b23e69c",
      "date": "2014-11-26T21:18:38.549Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.338Z"
    }, {
      "_id": "547815dbab43d1d4113abfef",
      "text": "Gee wiz, this is something special.",
      "userId": "534b8e5aaa5e7afc1b23e69b",
      "date": "2014-11-28T06:27:40.001Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.338Z"
    }, {
      "_id": "54781c69ab43d1d4113abff0",
      "text": "I think I like Ionic more than I like ice cream!",
      "userId": "534b8fb2aa5e7afc1b23e69c",
      "date": "2014-11-28T06:55:37.350Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.338Z"
    }, {
      "_id": "54781ca4ab43d1d4113abff1",
      "text": "Yea, it's pretty sweet",
      "userId": "534b8e5aaa5e7afc1b23e69b",
      "date": "2014-11-28T06:56:36.472Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.338Z"
    }, {
      "_id": "5478df86ab43d1d4113abff4",
      "text": "Wow, this is really something huh?",
      "userId": "534b8fb2aa5e7afc1b23e69c",
      "date": "2014-11-28T20:48:06.572Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.339Z"
    }, {
      "_id": "54781ca4ab43d1d4113abff1",
      "text": "Create amazing apps - ionicframework.com",
      "userId": "534b8e5aaa5e7afc1b23e69b",
      "date": "2014-11-29T06:56:36.472Z",
      "read": true,
      "readDate": "2014-12-01T06:27:38.338Z"
    }]];

    var messageCheckTimer;

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    $scope.goBack = function() {
      $ionicHistory.goBack();
    }

    $scope.$on('$ionicView.enter', function() {
      //console.log('UserMessages $ionicView.enter');

      getMessages();

      $timeout(function() {
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
      }, 0);

      messageCheckTimer = $interval(function() {
        // here you could check for new messages if your app doesn't use push notifications or user disabled them
      }, 20000);
    });

    $scope.$on('$ionicView.leave', function() {
      //console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      if (angular.isDefined(messageCheckTimer)) {
        $interval.cancel(messageCheckTimer);
        messageCheckTimer = undefined;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      if (!$scope.input.message || $scope.input.message === '') {
        localStorage.removeItem('userMessage-' + $scope.toUser._id);
      }
    });

    function getMessages() {
      // the service is mock but you would probably pass the toUser's GUID here
      MockService.getUserMessages({
        toUserId: $scope.toUser._id
      }).then(function(data) {
        $scope.doneLoading = true;
        $scope.messages = data.messages;
        $timeout(function() {
          viewScroll.scrollBottom();
        }, 0);
      });
    }

    $scope.$watch('input.message', function(newValue, oldValue) {
      //console.log('input.message $watch, newValue ' + newValue);
      if (!newValue) newValue = '';
      localStorage['userMessage-' + $scope.toUser._id] = newValue;
    });

    $scope.sendMessage = function(sendMessageForm) {
      var message = {
        toId: $scope.toUser._id,
        text: $scope.input.message
      };
      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices

      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';

      message._id = new Date().getTime(); // :~)
      message.date = new Date();
      message.username = $scope.user.username;
      message.userId = $scope.user._id;
      message.pic = $scope.user.picture;
      //console.log("message: ", message);
      $scope.messages.push(message);
      //console.log("$scope.message: ", $scope.message);

      $timeout(function() {
        viewScroll.scrollBottom(true);
      }, 0);

      $timeout(function() {
        $scope.messages.push(MockService.getMockMessage());
        viewScroll.scrollBottom(true);
      }, 2000);

      //});
    };


    $scope.onMessageHold = function(e, itemIndex, message) {
      //console.log('onMessageHold');
      //console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function(index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function() {
                viewScroll.resize();
              }, 0);

              break;
          }

          return true;
        }
      });
    };

    // this prob seems weird here but I have reasons for this in my app, secret!
    $scope.viewProfile = function(msg) {
      if (msg.userId === $scope.user._id) {
        // go to your profile
      } else {
        // go to other users profile
      }
    };

    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function(e, ta) {
      //console.log('taResize');
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;
      //console.log('taHeight: ' + taHeight);

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });

    function onProfilePicError(ele) {
      this.ele.src = ''; // set a fallback
    }

    // configure moment relative time
    moment.locale('en', {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%d sec",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      }
    });

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, UserService, $ionicHistory, $http) {
  $scope.user = UserService.getUser();
  $scope.date = new Date('1911-11-11 00:00:00');
  $scope.updateUser = {
      'firstname': 'CY',
      'lastname': 'Kwong',
      'nationality': 'TH',
      'date_of_birth': $scope.date.getTime() / 1000,
      'passport_number': '12345678',
      'visa_number': '999',
      'gender': 'male',
      'address': 'Hong Kong'
  };

  //console.log($scope.user);
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  $scope.update = function () {
    var params = {
        method: 'PUT',
        url: 'http://cathay-pacific-146715.appspot.com/api/v1/users',
        headers: {
            'X-WALKER-ACCESS-TOKEN': UserService.getUser().access_token
        },
        data: $scope.updateUser
    };

    //console.log(params);

    $http(params).then(function(response){
        //console.log(response);
        UserService.setUser(response.data);
        $scope.user = response.data;
    }, function(response){
        //console.log(response);
    });
  }

  // $scope.settings = {
  //   enableFriends: true
  // };
});
