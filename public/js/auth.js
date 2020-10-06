var auth = {
    editors: {},
    editorStatus: false,
    updates: false,
    signin: function() {
          var email = $('#email').val();
          var password = $('#password').val();
          var submit = $('#submit');
          submit.attr("disabled", true);
          var alertElement = $("#submit-error");
          if (email.length < 4) {
            auth.alert(alertElement, 'alert-warning', 'Please enter an email address.');
            submit.attr("disabled", false);
            return;
          }
          if (password.length < 4) {
            auth.alert(alertElement, 'alert-warning', 'Please enter a password.');
            submit.attr("disabled", false);
            return;
          }

          firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function() {
              window.location.href = '/content.html';
            })
            .catch(function(error) {
              var errorCode = error.code;
              var errorMessage = error.message;
              if (errorCode === 'auth/wrong-password') {
                auth.alert(alertElement, 'alert-warning', 'Wrong password.');
              } else if (errorCode === 'auth/user-not-found') {
                auth.alert(alertElement, 'alert-warning', 'There is no account with this email address.');
              } else {
                auth.alert(alertElement, 'alert-warning', errorMessage);
              }
              submit.attr("disabled", false);
            });
    },
    signout: function() {
        firebase.auth().signOut();
    },
    signup: function() {
        var name = $('#name').val();
        var email = $('#email').val();
        var password = $('#password').val();
        var updates = $('#email-updates').is(':checked');
        let submit = $('#submit');
        var alertElement = $("#submit-error");
        submit.attr("disabled", true);
        if (name.length < 4) {
          auth.alert(alertElement, 'alert-warning', 'Please enter a name.');
          submit.attr("disabled", false);
          return;
        }
        if (email.length < 4) {
          auth.alert(alertElement, 'alert-warning', 'Please enter an email address.');
          submit.attr("disabled", false);
          return;
        }
        if (password.length < 4) {
          auth.alert(alertElement, 'alert-warning', 'Please enter a password.');
          submit.attr("disabled", false);
          return;
        }
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
          if (updates == true) {
            updates = 'true';
          } else {
            updates = 'false'
          }
          firebase.auth().currentUser.updateProfile({ displayName: name, photoURL: updates}).then(function() {
            window.location.href = '/index.html';
          }).catch(function(error) {
            window.location.href = '/index.html';
          });
        }).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
            auth.alert(alertElement, 'alert-warning', 'The password is too weak.');
          } else {
            auth.alert(alertElement, 'alert-warning', errorMessage);
          }
          submit.attr("disabled", false);
          console.log(error);
        });
        // [END createwithemail]
    },
    sendEmailVerification: function() {
        firebase.auth().currentUser.sendEmailVerification()
          .then(function() {
            auth.alert($('#save-alert'), 'alert-success', 'Email verification sent!');
        })
          .catch(function() {
            auth.alert($('#save-alert'), 'alert-danger', 'Something went wrong');
         });
    },
    sendPasswordReset: function(item = $('#save-alert')) {
        var email;
        if (firebase.auth().currentUser) {
          email = firebase.auth().currentUser.email;
        } else {
          email = $('#email').val();
          console.log(email);
        }
        firebase.auth().sendPasswordResetEmail(email).then(function() {
          auth.alert(item, 'alert-success', 'Password reset email sent!');
        }).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == 'auth/invalid-email') {
            auth.alert($('#save-alert'), 'alert-danger', errorMessage);
          } else if (errorCode == 'auth/user-not-found') {
            auth.alert($('#save-alert'), 'alert-danger', errorMessage);
          }
          console.log(error);
        });
    },
    alert: function(item, addClass, text) {
        item.removeClass('alert-danger').removeClass('alert-success').removeClass('alert-warning').addClass(addClass).text(text).fadeIn();
        var alert = window.setTimeout(function() {
            item.fadeOut();
        }, 3500);
    },
    initApp: function(isEditorCallback, profile = false) {
        firebase.auth().onAuthStateChanged(function(user) {
          console.log(user);
          if (user) {
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            auth.isEditor(uid, isEditorCallback); 
            var providerData = user.providerData;
            if (profile) {
                $('#profile-name').val(user.displayName);
                $('#profile-email').val(user.email);
                if (user.photoURL === 'true') {
                  $('#profile-updates').prop('checked', true)
                };
                if (emailVerified) {
                    $('#profile-verified').show();
                    $('#profile-verify, #profile-verify-instructions').hide();
                } else {
                    $('#profile-verified').hide();
                    $('#profile-verify, #profile-verify-instructions').show();
                    $('#profile-verify').click(function() {
                        auth.sendEmailVerification();
                    });
                }
                $('#profile-save').click(function() {
                    auth.profile.save();
                });
                $('#profile-delete').click(function() {
                    $('#modal-delete').modal('show');
                    $('#modal-delete .modal-confirm').click(function() {
                        auth.profile.delete();
                    });
                });
                $('#profile-reset').click(function() {
                    auth.sendPasswordReset();
                });
            }
            $('.auth-only').show();
            $('#account-name').text(displayName);
            $('#signout').click(function() {
              auth.signout();
            });
          } else {
            if (profile) {
              window.location.href = "/index.html";
            }
            auth.editorStatus = false;
            isEditorCallback();
            $('.auth-only').fadeOut();
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
            }).catch(function(err) {
              console.log('Error: ' + err)
            });
        }
    },
    profile: {
      save: function() {
        let name = $('#profile-name').val();
        let email = $('#profile-email').val();
        let updates = $('#profile-updates').is(":checked") ? 'true' : 'false';
        console.log(updates, firebase.auth().currentUser.photoURL);
        let emailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (name && email && name.match(/^[A-Za-z ]+$/) && emailTest.test(email)) {
            var user = firebase.auth().currentUser;
            if (name !== user.displayName || updates !== user.photoURL) {
                user.updateProfile({ displayName: name, photoURL: updates }).then(function() {
                    auth.alert($('#save-alert'), 'alert-success', 'Name saved.');
                }).catch(function(error) {
                    auth.alert($('#save-alert'), 'alert-danger', 'Name not saved.');
                });
            }
            if (email != user.email) {
                user.updateEmail(email).then(function() {
                    auth.alert($('#save-alert-2'), 'alert-success', 'Email saved.');
                    if (firebase.auth().currentUser.emailVerified) {
                        $('#profile-verified').show();
                        $('#profile-verify, #profile-verify-instructions').hide();
                    } else {
                        $('#profile-verified').hide();
                        $('#profile-verify, #profile-verify-instructions').show();
                        $('#profile-verify').off().click(function() {
                            auth.sendEmailVerification();
                        });
                    }
                }).catch(function(error) {
                    if (error.code == 'auth/requires-recent-login') {
                      $('#modal-resignin').modal('show');
                      $('#modal-enter').off().click(function() {
                        let credential = {
                            email: $('#modal-email').val(),
                            password: $('#modal-password').val()
                        }
                        if (credential.email && credential.password && credential.email.length > 4 && credential.password.length > 4) {
                            let credentialReturn = firebase.auth.EmailAuthProvider.credential(credential.email, credential.password);
                            user.reauthenticateWithCredential(credentialReturn).then(function() {
                                $('#modal-resignin').modal('hide');
                                $('#modal-resignin .action').text('update your email address');
                                user.updateEmail(email).then(function() {
                                    auth.alert($('#save-alert-2'), 'alert-success', 'Email saved.');
                                    if (firebase.auth().currentUser.emailVerified) {
                                        $('#profile-verified').show();
                                        $('#profile-verify, #profile-verify-instructions').hide();
                                    } else {
                                        $('#profile-verified').hide();
                                        $('#profile-verify, #profile-verify-instructions').show();
                                        $('#profile-verify').off().click(function() {
                                            auth.sendEmailVerification();
                                        });
                                    }
                                }).catch(function(error) {
                                    auth.alert($('#save-alert-2'), 'alert-danger', 'Something went wrong.')
                                });
                            }).catch(function() {
                                auth.alert($('#save-alert-2'), 'alert-danger', 'Re-Authentication failed.');
                            });
                        }
                      });
                    } else {
                        auth.alert($('#save-alert-2'), 'alert-danger', 'Something went wrong.');
                    }
                });
            }
        }
      },
      delete: function() {
        var user = firebase.auth().currentUser;

        $('#modal-resignin').modal('show');
        $('#modal-delete').modal('hide');
        $('#modal-resignin .action').text('delete your account');
        $('#modal-enter').off().click(function() {
          let credential = {
              email: $('#modal-email').val(),
              password: $('#modal-password').val()
          }
          if (credential.email && credential.password && credential.email == user.email && credential.password.length > 4) {
              let credentialReturn = firebase.auth.EmailAuthProvider.credential(credential.email, credential.password);
              user.reauthenticateWithCredential(credentialReturn).then(function() {
                  $('#modal-resignin').modal('hide');
                  user.delete().then(function() {
                    window.location.href = "index.html";
                  }).catch(function(error) {
                    auth.alert($('#save-alert-2'), 'alert-danger', 'Something went wrong.')
                  });
              }).catch(function(err) {
                  auth.alert($('#save-alert-2'), 'alert-danger', 'Re-Authentication failed.');
                  console.log(err);
              });
          } 
        });
      }
    }
}