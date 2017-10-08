//var http = require('http');
var fs = require('fs');
var express = require('express');
var md5Coder = require('md5');
var bodyParser = require('body-parser');

var bruteForce = require('./bruteforce.js');
var readWriteDB = require('./readwritedb.js');
var checkUser = require('./checkuser.js');
var myEmailer = require('./emailer.js');
var validateFields = require('./validatefields.js');


var pug = require('pug');

var app = express();

app.set('view engine', 'pug');

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/views'));

var sendUserMsg = pug.compileFile(__dirname + '/views/usermsg.pug');
// var sendLoginForm = pug.compileFile(__dirname + '/views/login.pug');
// var sendSignupForm = pug.compileFile(__dirname + '/views/signup.pug');
// var sendForgotPswForm = pug.compileFile(__dirname + '/views/forgotpsw.pug');

var servicePort = 8080;
var serviceDomain = 'localhost';
var servicePath = 'http://' + serviceDomain + ':' + servicePort;

// create application/x-www-form-urlencoded parser
//var myParser = bodyParser.text({ type: 'text/plain' });
var myParser = bodyParser.urlencoded({
  extended: true
});


// Parameters for res.send(...) method
var sendFileOptions = {
  root: __dirname + '/html',
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};


app.get('/', function(req, res) {
  res.sendFile('login.html', sendFileOptions, function(err) {
    if (err) {
      throw err;
    }
  });
});


app.get('/login', function(req, res) {
  res.sendFile('login.html', sendFileOptions, function(err) {
    if (err) {
      throw err;
    }
  });
});


app.get('/signup', function(req, res) {
  res.sendFile('signup.html', sendFileOptions, function(err) {
    if (err) {
      throw err;
    }
  });
});


app.get('/forgotpsw', function(req, res) {

  res.render('forgotpsw', function(err, html) {
    if (err) {
      throw err;
    }
    res.send(html);
  });

});


app.get('/userConfirm', function(req, res) {

  res.render('confirmresend', function(err, html) {
    if (err) {
      throw err;
    }
    res.send(html);
  });

});



app.get('/resetpsw/:pswReset', function(req, res) {

  checkUser("userPswResetLink", req.params.pswReset, function(userExist) {

    if (userExist.length > 0) {

      res.render('resetpsw', {
        userMsg: '"' + userExist[0].userEmail + '"',
        userSecretQ: userExist[0].userSecretQ
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    } else {

      res.render('usermsg', {
        userMsg: 'E-posta adresi bulunamadı ya da geçersiz link.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  });
});


app.get('/userconfirm/:mailConfirm', function(req, res) {

  checkUser("userConfirmLink", req.params.mailConfirm, function(userExist) {

    if (userExist.length > 0) {

      var myOptions1 = {
        "myDemand": 'updateDocument',
        "myCollection": 'credentials',
        "myDocument": {
          $set: {
            userConfirmStatus: true
          }
        },
        "myQuery": {
          userConfirmLink: req.params.mailConfirm
        }, // Query as a json object e.g. { name: 'Ahmet' };
      };

      readWriteDB(myOptions1, function(result1) {
        dbData1 = result1;

        if (dbData1.nModified == 0) {

          res.render('usermsg', {
            userMsg: 'Hesabınız daha önce aktifleştirilmişti.'
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        } else if (dbData1.nModified == 1) {

          res.render('usermsg', {
            userMsg: 'Hesabınız aktifleştirilmiştir.'
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

          var myOptions2 = {
            "myDemand": 'updateDocument',
            "myCollection": 'credentials',
            "myDocument": {
              $set: {
                userConfirmLink: md5Coder(Date() + userExist[0].userEmail)
              }
            },
            "myQuery": {
              userEmail: userExist[0].userEmail
            }, // Query as a json object e.g. { name: 'Ahmet' };
          };

          readWriteDB(myOptions2, function(result2) {
            dbData2 = result2;

            if (dbData2.nModified == 0) {

              res.render('usermsg', {
                userMsg: 'HATA: Yeni onay linki oluşturulurken hata oluştu. Size gönderilen linke tekrar tıklayınız.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            }

          }); // readWriteDB 2 ends here
        }
      }); // readWriteDB 1 ends here
    } else {

      res.render('usermsg', {
        userMsg: 'HATA: Hatalı link ya da kullanıcı.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  }); // checkuser ends here
}); // app.get ends here


app.post('/resetPswForm', myParser, bruteForce.globalBruteforce.prevent, bruteForce.userBruteforce.getMiddleware({
  key: function(req, res, next) {
    // prevent too many attempts for the same username
    next(req.body.userEmail);
  }
}), function(req, res) {

  validateFields(req.body, function(validation) {

    if (validation) {

      checkUser("userEmail", req.body.userEmail, function(userExist) {

        if (userExist.length > 0 && userExist[0].userSecretA == md5Coder(req.body.userSecretA)) {

          var myNewRecord = {
            $set: {
              "userPsw": md5Coder(req.body.userPsw),
              "userConfirmLink": md5Coder(Date() + userExist[0].userEmail),
              "userPswResetLink": md5Coder(Date() + userExist[0].userPsw)
            }
          };

          var myOptions = {
            "myDemand": 'updateDocument',
            "myCollection": 'credentials',
            "myDocument": myNewRecord,
            "myQuery": {
              userEmail: userExist[0].userEmail
            },
          };

          readWriteDB(myOptions, function(result) {
            dbData = result;

            if (dbData.nModified == 1) {

              res.render('usermsg', {
                userMsg: 'Sn. <strong>' + userExist[0].userNameSurname + '</strong>, şifreniz başarılı şekilde güncellenmiştir.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });


            } else if (dbData.nModified == 0) {

              res.render('usermsg', {
                userMsg: 'Şifreniz güncellenemedi! Lütfen tekrar deneyiniz.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });
            }

          }); // readWriteDB ends here

        } else {

          res.render('usermsg', {
            userMsg: 'Kullanıcı bilgileri hatalı. Kontrol edip tekrar deneyiniz.'
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        }

      }); // checkuser ends here

    } else if (validation) {

      res.render('usermsg', {
        userMsg: 'Form alanları uygun niteliklerde girilmediğinden ya da form bozulduğundan talebiniz gerçekleştirilmedi.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    } // else if (validation) ends here
  }); // checkuser ends here
}); // app.post ends here


app.post('/loginForm', myParser, bruteForce.globalBruteforce.prevent, bruteForce.userBruteforce.getMiddleware({
  key: function(req, res, next) {
    next(req.body.userEmail);
  }
}), function(req, res) {

  validateFields(req.body, function(validation) {

    if (validation) {

      checkUser("userEmail", req.body.userEmail, function(userExist) {

        if (userExist.length == 0) {

          res.render('usermsg', {
            userMsg: 'Kullanıcı adı/şifre bilgileri hatalıdır. Kontrol ederek tekrar deneyiniz.'
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        } else if (userExist.length > 0 && userExist[0].userConfirmStatus == true) {

          if (userExist[0].userEmail == req.body.userEmail && userExist[0].userPsw == md5Coder(req.body.userPsw)) {

            req.brute.reset(function() {});

            res.render('usermsg', {
              userMsg: 'Sn. <strong>' + userExist[0].userNameSurname + '</strong>, başarılı şekilde giriş yaptınız.'
            }, function(err, html) {
              if (err) {
                throw err;
              }
              res.send(html);
            });

          } else {

            res.render('usermsg', {
              userMsg: 'Kullanıcı adı/şifre bilgileri hatalıdır. Lütfen tekrar deneyiniz.'
            }, function(err, html) {
              if (err) {
                throw err;
              }
              res.send(html);
            });

          }


        } else if (userExist.length > 0 && userExist[0].userConfirmStatus == false) {


          if (userExist[0].userEmail == req.body.userEmail && userExist[0].userPsw == md5Coder(req.body.userPsw)) {

            var userMessage = 'Sn. <strong>' + userExist[0].userNameSurname + '</strong>, <br><br>';
            userMessage += 'E-posta adresinize gönderilen onay linkine tıklayarak hesabınızı doğrulamanız gerekmektedir.<br><br>';
            userMessage += 'Doğrulama linki hesabınıza daha önce ulaşmadıysa eposta adresinize yeni bir doğrulama linki göndermek için aşağıdaki linke tıklayınız.<br><br>';
            userMessage += '<a href="/userConfirm">[Yeni doğrulama linki gönder]</a>';

            res.render('usermsg', {
              userMsg: userMessage
            }, function(err, html) {
              if (err) {
                throw err;
              }
              res.send(html);
            });

          } else {

            res.render('usermsg', {
              userMsg: 'Kullanıcı adı/şifre bilgileri hatalıdır. Kontrol ederek tekrar deneyiniz.'
            }, function(err, html) {
              if (err) {
                throw err;
              }
              res.send(html);
            });

          }

        }

      }); // checkUser ends here

    } else if (validation) {

      res.render('usermsg', {
        userMsg: 'Form alanları uygun niteliklerde girilmediğinden ya da form bozulduğundan talebiniz gerçekleştirilmedi.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  }); // validateFields ends here
}); // app.post ends here


app.post('/signupForm', myParser, bruteForce.globalBruteforce.prevent, bruteForce.userBruteforce.getMiddleware({
  key: function(req, res, next) {
    // prevent too many attempts for the same username
    next(req.body.userEmail);
  }
}), function(req, res) {

  validateFields(req.body, function(validation) {

    if (validation) {

      checkUser("userEmail", req.body.userEmail, function(userExist) {

        if (userExist.length > 0) {

          res.render('usermsg', {
            userMsg: 'Bu e-posta adresiyle daha önce kayıt yapılmıştır. Giriş ekranına gidiniz.'
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        } else {

          var myNewRecord = {
            "userNameSurname": req.body.userNameSurname,
            "userEmail": req.body.userEmail,
            "userPsw": md5Coder(req.body.userPsw),
            "userSignupDate": Date(),
            "userConfirmStatus": false,
            "userConfirmLink": md5Coder(Date() + req.body.userEmail),
            "userPswResetLink": md5Coder(Date() + req.body.userPsw),
            "userSecretQ": req.body.userSecretQ,
            "userSecretA": md5Coder(req.body.userSecretA),
          };

          var myOptions = {
            "myDemand": 'insertDocument',
            "myCollection": 'credentials',
            "myDocument": myNewRecord,
            "myQuery": '',
          };

          readWriteDB(myOptions, function(result) {
            dbData = result;

            if (dbData.ok == 1) {

              var mailContent = 'Hesabınızı aktifleştirmek için aşağıdaki linke tıklayınız:<br><br>';
              mailContent += '<a href="' + servicePath + '/userconfirm/' + myNewRecord.userConfirmLink + '">[Hesabımı Aktifleştir]</a>';

              var myHtml = sendUserMsg({
                userMsg: mailContent
              });

              myEmailer(myNewRecord.userEmail, 'Kayıt için onayınız gerekli', myHtml, function(myReturn) {

                if (myReturn.accepted[0] == myNewRecord.userEmail) {

                  var userMessage = 'Sn. <strong>' + myNewRecord.userNameSurname + '</strong>, kaydınız başarıyla yapılmıştır.<br><br>';
                  userMessage += 'E-posta adresinize bir link gönderilmiştir. ';
                  userMessage += 'Kaydınızın onaylanması için e-posta adresinize gönderilen linke tıklamanız gerekmektedir.';
                  res.render('usermsg', {
                    userMsg: userMessage
                  }, function(err, html) {
                    if (err) {
                      throw err;
                    }
                    res.send(html);
                  });

                } else {

                  res.render('usermsg', {
                    userMsg: myReturn.rejected[0] + ' adresine eposta iletilemedi ya da bir hata oluştu. Lütfen adresi kontrol edip yeniden gönderiniz.'
                  }, function(err, html) {
                    if (err) {
                      throw err;
                    }
                    res.send(html);
                  });

                }

              });

            } else if (dbData.ok == 0) {

              res.render('usermsg', {
                userMsg: 'Bir hatadan dolayı kayıt yapılamadı. Lütfen tekrar deneyiniz.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            }

          });
        }
      });
    } else if (validation) {

      res.render('usermsg', {
        userMsg: 'Form alanları uygun niteliklerde girilmediğinden ya da form bozulduğundan talebiniz gerçekleştirilmedi.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  });
});


app.post('/forgotPswForm', myParser, bruteForce.globalBruteforce.prevent, bruteForce.userBruteforce.getMiddleware({
  key: function(req, res, next) {
    // prevent too many attempts for the same username
    next(req.body.userEmail);
  }
}), function(req, res) {

  validateFields(req.body, function(validation) {

    if (validation) {

      checkUser("userEmail", req.body.userEmail, function(userExist) {

        if (userExist.length > 0) {

          var mailContent = 'Şifrenizi yeniden belirlemek için aşağıdaki linke tıklayınız:<br><br>';
          mailContent += '<a href="' + servicePath + '/resetpsw/' + userExist[0].userPswResetLink + '">[Şifremi yeniden belirle]</a>';

          var myHtml = sendUserMsg({
            userMsg: mailContent
          });

          myEmailer(userExist[0].userEmail, 'Şifre yenileme linki', myHtml, function(myReturn) {

            if (myReturn.accepted[0] == userExist[0].userEmail) {

              var userMessage = '<strong>' + userExist[0].userEmail + '</strong> ';
              userMessage += 'adresine gönderilen linke tıklayarak şifrenizi yeniden belirleyebilirsiniz.<br><br>';

              res.render('usermsg', {
                userMsg: userMessage
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            } else {

              res.render('usermsg', {
                userMsg: myReturn.rejected[0] + ' adresine eposta iletilemedi ya da bir hata oluştu. Lütfen adresi kontrol edip yeniden gönderiniz.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            }

          });

        } else if (userExist.length == 0) {

          var userMessage = 'Sistemimizde böyle bir kullanıcı bulunmamaktadır.<br><br>';
          userMessage += 'Kayıt yapmak için lütfen <a href="./signup">buraya tıklayınız</a>';

          res.render('usermsg', {
            userMsg: userMessage
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        }
      });
    } else if (validation) {

      res.render('usermsg', {
        userMsg: 'Form alanları uygun niteliklerde girilmediğinden ya da form bozulduğundan talebiniz gerçekleştirilmedi.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  });
});


app.post('/confirmEmailForm', myParser, bruteForce.globalBruteforce.prevent, bruteForce.userBruteforce.getMiddleware({
  key: function(req, res, next) {
    // prevent too many attempts for the same username
    next(req.body.userEmail);
  }
}), function(req, res) {

  validateFields(req.body, function(validation) {

    if (validation) {

      checkUser("userEmail", req.body.userEmail, function(userExist) {

        if (userExist.length > 0) {

          var mailContent = 'Hesabınızı aktifleştirmek için aşağıdaki linke tıklayınız:<br><br>';
          mailContent += '<a href="' + servicePath + '/userconfirm/' + userExist[0].userConfirmLink + '">[Hesabımı Aktifleştir]</a>';

          var myHtml = sendUserMsg({
            userMsg: mailContent
          });

          myEmailer(userExist[0].userEmail, 'Kayıt için onayınız gerekli', myHtml, function(myReturn) {

            if (myReturn.accepted[0] == userExist[0].userEmail) {

              var userMessage = '<strong>' + userExist[0].userEmail + '</strong> ';
              userMessage += 'adresine gönderilen linke tıklayarak şifrenizi yeniden belirleyebilirsiniz.<br><br>';

              res.render('usermsg', {
                userMsg: userMessage
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            } else {

              res.render('usermsg', {
                userMsg: myReturn.rejected[0] + ' adresine eposta iletilemedi ya da bir hata oluştu. Lütfen adresi kontrol edip yeniden gönderiniz.'
              }, function(err, html) {
                if (err) {
                  throw err;
                }
                res.send(html);
              });

            }

          });

        } else if (userExist.length == 0) {

          var userMessage = 'Sistemimizde böyle bir kullanıcı bulunmamaktadır.<br><br>';
          userMessage += 'Kayıt yapmak için lütfen <a href="./signup">buraya tıklayınız</a>';

          res.render('usermsg', {
            userMsg: userMessage
          }, function(err, html) {
            if (err) {
              throw err;
            }
            res.send(html);
          });

        }
      });
    } else if (validation) {

      res.render('usermsg', {
        userMsg: 'Form alanları uygun niteliklerde girilmediğinden ya da form bozulduğundan talebiniz gerçekleştirilmedi.'
      }, function(err, html) {
        if (err) {
          throw err;
        }
        res.send(html);
      });

    }
  });
});


app.listen(servicePort);
