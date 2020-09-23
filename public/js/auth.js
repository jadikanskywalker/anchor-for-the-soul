var auth = {
    editors: {},
    editorStatus: false,
    signin: function() {
          $("#submit").attr("disabled", true);
          var email = $('#email').val();
          var password = $('#password').val();
          var submit = $('#submit');
          var error = $("#submit-error");
          if (email.length < 4) {
            error.text('Please enter an email address.').show();
            $("#btnSubmit").attr("disabled", false);
            return;
          }
          if (password.length < 4) {
            error.text('Please enter a password.').show();
            $("#btnSubmit").attr("disabled", false);
            return;
          }

          firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(error) {
              var errorCode = error.code;
              var errorMessage = error.message;
              if (errorCode === 'auth/wrong-password') {
                error.text('Wrong password.').show();
              } else {
                error.text(errorMessage).show();
              }
              console.log(error);
              $("#btnSubmit").attr("disabled", false);
            })
            .then(function() {
                window.location.href = '/content.html';
            });
    },
    signout: function() {
        firebase.auth().signOut();
    },
    initApp: function(isEditorCallback) {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            auth.isEditor(uid, isEditorCallback); 
            var providerData = user.providerData;
            $('#signout').fadeIn().click(function() {
                auth.signout();
            });
          } else {
            auth.editorStatus = false;
            isEditorCallback();
            $('#signout').fadeOut();
            return;
          }
        });
    },
    isEditor(uid, isEditorCallback) {
        if (Object.keys(auth.editors).length > 0) {
            for (key in editors) {
                if (data[key] && key == uid) {
                    auth.editorStatus = true;
                } else {
                    auth.editorStatus = false;
                }
                isEditorCallback();
            }
        } else {
            $.when(
                $.ajax({
                    url: 'https://anchor-for-the-soul.firebaseio.com/editors.json',
                    data: {
                        orderBy: '"$key"',
                        limitToLast: 10
                    },
                    success: function(data, status, jqXHR) {
                        auth.editors = data;
                        for (key in data) {
                            if (data[key] && key == uid) {
                                auth.editorStatus = true;
                            } else {
                                auth.editorStatus = false;
                            }
                        }
                    }
                })
            ).then(function() {
                isEditorCallback();
            });
        }
    }
}