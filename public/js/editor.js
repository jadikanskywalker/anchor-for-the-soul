var editor = {
  // Comment and modularize
  database: firebase.database(),
  init: function () {
    var pathname = window.location.pathname;

    if (pathname.startsWith("/article")) {
      editor.article.setClickhandlers();
    } else if (pathname.startsWith("/episode")) {
      editor.episode.setClickhandlers();
    }
  },
  alert: function (item, addClass, text) {
    console.log("alert");
    item
      .removeClass(["alert-danger", "alert-success"])
      .addClass(addClass)
      .text(text)
      .fadeIn();
    var alert = window.setTimeout(function () {
      item.fadeOut();
    }, 2000);
  },
  article: {
    setClickhandlers: function () {
      var id;
      $(".editor-delete")
        .off()
        .click(function () {
          id = $(this).attr("placeid");
          $("#modal-delete").modal("show");
        });
      $(".editor-add")
        .off()
        .click(function () {
          id = $(this).attr("placeid");
          $("#modal-add").modal("show");
        });
      $("#modal-delete .modal-confirm")
        .off()
        .click(function () {
          $("#modal-delete").modal("hide");
          editor.article.deleteSection(id);
        });
      $("#modal-add .modal-confirm")
        .off()
        .click(function () {
          $("#modal-add").modal("hide");
          let style = $('input[name="style"]:checked').val();
          editor.article.addSection(id, style);
        });
      $("#modal-delete-article .modal-confirm")
        .off()
        .click(function () {
          let published = api.params.get("published");
          if (published === "false") {
            editor.article.delete(
              "unpublished/articles/",
              "unpublished/articleContents/"
            );
          } else {
            editor.article.delete();
          }
        });
      $("#editor-item-save")
        .off()
        .click(function () {
          let published = new URLSearchParams(window.location.search).get(
            "published"
          );
          if (published !== "false") {
            editor.article.save();
          } else {
            editor.article.save(
              "unpublished/articles/",
              "unpublished/articleContents/",
              function () {
                editor.alert(
                  $("#save-alert"),
                  "alert-success",
                  "Changes saved."
                );
              }
            );
          }
        });
      $("#editor-item-publish")
        .off()
        .click(function () {
          editor.article.save(
            "articles/",
            "articleContents/",
            function () {
              let articleID = api.params.get("id");
              let updates = {};
              updates["unpublished/articles/" + articleID] = null;
              updates["unpublished/articleContents/" + articleID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-item-publish").hide();
                  $("#editor-item-unpublish").show();
                  $("#editor-item-published").show();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/article.html?id=" + api.params.get("id")
                  );
                  api.params = new URLSearchParams(window.location.search);
                  api.item(articleID, "article");
                  editor.alert(
                    $("#save-alert"),
                    "alert-success",
                    "Article published."
                  );
                })
                .catch(function (err) {
                  editor.alert(
                    $("#save-alert"),
                    "alert-warning",
                    "Article published. Unpublished copy not deleted."
                  );
                });
            },
            true
          );
        });
      $("#editor-item-unpublish")
        .off()
        .click(function () {
          editor.article.save(
            "unpublished/articles/",
            "unpublished/articleContents/",
            function () {
              let articleID = api.params.get("id");
              let updates = {};
              updates["articles/" + articleID] = null;
              updates["articleContents/" + articleID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-item-publish").show();
                  $(
                    "#editor-item-published, #editor-item-unpublish"
                  ).hide();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/article.html?id=" +
                      api.params.get("id") +
                      "&published=false"
                  );
                  api.params = new URLSearchParams(window.location.search);
                  api.item(articleID, "article");
                  editor.alert(
                    $("#save-alert"),
                    "alert-success",
                    "Article unpublished."
                  );
                })
                .catch(function (err) {
                  editor.alert(
                    $("#save-alert"),
                    "alert-warning",
                    "Article not unpublished. However, a copy was saved to unpublished."
                  );
                });
            },
            true
          );
        });
      $("#editor-item-delete")
        .off()
        .click(function () {
          $("#modal-delete-article").modal("show");
        });
      $("#accessibility-preview").click(function () {
        console.log("triggered preview");
        api.item(api.params.get("id"), "article", true);
      });
      $("#accessibility-preview-2")
        .show()
        .click(function () {
          console.log("triggered preview");
          api.item(api.params.get("id"), "article");
          if ($("body").hasClass("dark")) {
            $("#accessibility-color").click();
          }
          $('.dropdown-menu .dropdown-item[size="md"]').click();
        });
    },
    deleteSection: function (id) {
      if ($("#item-content > div").length > 1) {
        $("#" + id)
          .parent()
          .remove();
      }
    },
    addSection: function (startID, style) {
      let content;
      api.highestID++;
      if (style == "p") {
        content =
          "<div class='editor-editable'><div contenteditable id='" +
          api.highestID +
          "'  type='p' class='bg-light content-editable' style='width:100%;'> </div> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "</div>";
      } else if (style == "h3") {
        content =
          "<div class='editor-input'><input id='" +
          api.highestID +
          "' type='h3' value='' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "<div>";
      } else if (style == "h4") {
        content =
          "<div class='editor-input'><input id='" +
          api.highestID +
          "' type='h4' value='' class='bg-light h4' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "<div>";
      }
      $("#" + startID)
        .parent()
        .after(content);
      editor.article.setClickhandlers();
    },
    save: function (
      articles = "articles/",
      articleContent = "articleContents/",
      callback = null,
      publish = false
    ) {
      let articleID = api.params.get("id");
      // Article Header
      let header = {
        date: $("#item-date").val(),
        title: $("#item-title").text(),
        id: articleID,
        description: $("#item-description").text(),
        topic: $("#item-topic").val(),
      };
      let currentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, -1);
      if (publish) {
        header.date = currentDate;
      }
      // Article Content
      var feilds = $("#item-content").children();
      var content = {};
      var current, key, value, indexStr;
      var num = 0;
      feilds.each(function (index) {
        if ($(this).hasClass("editor-editable")) {
          current = $(this).find("div.content-editable");
          key = current.attr("type");
          value = current.text();
        } else if ($(this).hasClass("editor-input")) {
          current = $(this).find("input");
          key = current.attr("type");
          value = current.val();
        }

        indexStr = num.toString();
        if (key == "p" || key == "h3" || (key == "h4" && value.length > 1)) {
          content[indexStr] = {};
          content[indexStr][key] = value;
          num++;
        }
      });
      // Update Database
      if (articleID != "new") {
        let updates = {};
        console.log(articles + articleID, articleContent + articleID)
        updates[articles + articleID] = header;
        updates[articleContent + articleID] = content;
        editor.database
          .ref()
          .update(updates)
          .then((res) => {
            if (callback) {
              callback();
              if (publish) {
                $("#item-date").val(currentDate);
              }
            } else {
              editor.alert(
                $("#save-alert"),
                "alert-success",
                "Changes published."
              );
            }
          })
          .catch((err) => {
            editor.alert(
              $("#save-alert"),
              "alert-danger",
              "Something went wrong. Err: " + err
            );
          });
      } else if (articleID == "new") {
        var newRef = editor.database.ref("articles/").push();
        header.id = newRef.key;
        let updates = {};
        updates["unpublished/articles/" + newRef.key] = header;
        updates["unpublished/articleContents/" + newRef.key] = content;
        editor.database
          .ref()
          .update(updates)
          .then((res) => {
            window.location.href =
              "/article.html?id=" + newRef.key + "&published=false";
          })
          .catch((err) => {
            editor.alert(
              $("#save-alert"),
              "alert-danger",
              "Something went wrong. Err: " + err
            );
          });
      }
    },
    delete: function (articles = "articles/", articleContent = "articleContents/") {
      let articleID = api.params.get("id");
      if (articleID != "new") {
        editor.article.save(
          "archive/articles/",
          "archive/articleContents/",
          function () {
            let updates = {};
            updates[articles + articleID] = null;
            updates[articleContent + articleID] = null;
            editor.database
              .ref()
              .update(updates)
              .then(() => {
                window.location.href = "/content.html";
              })
              .catch((err) => {
                editor.alert(
                  $("#save-alert"),
                  "alert-danger",
                  "Something went wrong. Err: " + err
                );
              });
          }
        );
      }
    },
  },
  episode: {
    setClickhandlers: function () {
      var id;
      $(".editor-delete")
        .off()
        .click(function () {
          id = $(this).attr("placeid");
          $("#modal-delete").modal("show");
        });
      $(".editor-add")
        .off()
        .click(function () {
          id = $(this).attr("placeid");
          $("#modal-add").modal("show");
        });
      $("#modal-delete .modal-confirm")
        .off()
        .click(function () {
          $("#modal-delete").modal("hide");
          editor.episode.deleteSection(id);
        });
      $("#modal-add .modal-confirm")
        .off()
        .click(function () {
          $("#modal-add").modal("hide");
          let style = $('input[name="style"]:checked').val();
          editor.episode.addSection(id, style);
        });
      $("#modal-delete-episode .modal-confirm")
        .off()
        .click(function () {
          let published = api.params.get("published");
          if (published === "false") {
            editor.episode.delete(
              "unpublished/episodes/",
              "unpublished/episodeContents/"
            );
          } else {
            editor.episode.delete();
          }
        });
      $("#editor-item-save")
        .off()
        .click(function () {
          let published = new URLSearchParams(window.location.search).get(
            "published"
          );
          if (published !== "false") {
            editor.episode.save();
          } else {
            editor.episode.save(
              "unpublished/episodes/",
              "unpublished/episodeContents/",
              function () {
                editor.alert(
                  $("#save-alert"),
                  "alert-success",
                  "Changes saved."
                );
              }
            );
          }
        });
      $("#editor-item-publish")
        .off()
        .click(function () {
          editor.episode.save(
            "episodes/",
            "episodeContents/",
            function () {
              let episodeID = api.params.get("id");
              let updates = {};
              updates["unpublished/episodes/" + episodeID] = null;
              updates["unpublished/episodeContents/" + episodeID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-item-publish").hide();
                  $("#editor-item-unpublish").show();
                  $("#editor-item-published").show();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/episode.html?id=" + api.params.get("id")
                  );
                  api.params = new URLSearchParams(window.location.search);
                  api.item(episodeID, "episode");
                  editor.alert(
                    $("#save-alert"),
                    "alert-success",
                    "Episode published."
                  );
                })
                .catch(function (err) {
                  editor.alert(
                    $("#save-alert"),
                    "alert-warning",
                    "Episode published. Unpublished copy not deleted."
                  );
                });
            },
            true
          );
        });
      $("#editor-item-unpublish")
        .off()
        .click(function () {
          editor.episode.save(
            "unpublished/episodes/",
            "unpublished/episodeContents/",
            function () {
              let episodeID = api.params.get("id");
              let updates = {};
              updates["episodes/" + episodeID] = null;
              updates["episodeContents/" + episodeID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-item-publish").show();
                  $(
                    "#editor-item-published, #editor-item-unpublish"
                  ).hide();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/episode.html?id=" +
                      api.params.get("id") +
                      "&published=false"
                  );
                  api.params = new URLSearchParams(window.location.search);
                  api.item(episodeID, "episode");
                  editor.alert(
                    $("#save-alert"),
                    "alert-success",
                    "Episode unpublished."
                  );
                })
                .catch(function (err) {
                  editor.alert(
                    $("#save-alert"),
                    "alert-warning",
                    "Episode not unpublished. However, a copy was saved to unpublished."
                  );
                });
            },
            true
          );
        });
      $("#editor-item-delete")
        .off()
        .click(function () {
          $("#modal-delete-episode").modal("show");
        });
      $("#accessibility-preview")
        .off()
        .click(function () {
          console.log("triggered preview");
          api.item(api.params.get("id"), "episode", true);
        });
      $("#accessibility-preview-2")
        .off()
        .show()
        .click(function () {
          console.log("triggered preview");
          api.item(api.params.get("id"), "episode");
          if ($("body").hasClass("dark")) {
            $("#accessibility-color").click();
          }
          $('.dropdown-menu .dropdown-item[size="md"]').click();
        });
    },
    deleteSection: function (id) {
      if ($("#item-content > div").length > 1) {
        $("#" + id)
          .parent()
          .remove();
      }
    },
    addSection: function (startID, style) {
      let content;
      api.highestID++;
      if (style == "p") {
        content =
          "<div class='editor-editable'><div contenteditable id='" +
          api.highestID +
          "'  type='p' class='bg-light content-editable' style='width:100%;'> </div> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "</div>";
      } else if (style == "h3") {
        content =
          "<div class='editor-input'><input id='" +
          api.highestID +
          "' type='h3' value='' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "<div>";
      } else if (style == "h4") {
        content =
          "<div class='editor-input'><input id='" +
          api.highestID +
          "' type='h4' value='' class='bg-light h4' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
          api.highestID +
          "'>x</button>" +
          '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
          api.highestID +
          '">+</button> </div>' +
          "<div>";
      }
      $("#" + startID)
        .parent()
        .after(content);
      editor.episode.setClickhandlers();
    },
    save: function (
      episodes = "episodes/",
      episodeContent = "episodeContents/",
      callback = null,
      publish = false
    ) {
      let episodeID = api.params.get("id");
      // Episode Header
      let header = {
        date: $("#item-date").val(),
        title: $("#item-title").text(),
        id: episodeID,
        description: $("#item-description").text(),
        topic: $("#item-topic").val(),
        pid: $("#item-pid").val(),
      };
      let currentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, -1);
      if (publish || !header.date) {
        header.date = currentDate;
      }
      // Episode Content
      var feilds = $("#item-content").children();
      var content = {};
      var current, key, value, indexStr;
      var num = 0;
      feilds.each(function (index) {
        if ($(this).hasClass("editor-editable")) {
          current = $(this).find("div.content-editable");
          key = current.attr("type");
          value = current.text();
        } else if ($(this).hasClass("editor-input")) {
          current = $(this).find("input");
          key = current.attr("type");
          value = current.val();
        }
        indexStr = num.toString();
        if (key == "p" || key == "h3" || (key == "h4" && value.length > 1)) {
          content[indexStr] = {};
          content[indexStr][key] = value;
          num++;
        }
      });
      // Update Database
      if (episodeID != "new") {
        let updates = {};
        updates[episodes + episodeID] = header;
        updates[episodeContent + episodeID] = content;
        editor.database
          .ref()
          .update(updates)
          .then((res) => {
            if (callback) {
              callback();
              if (publish) {
                $("#item-date").val(currentDate);
              }
            } else {
              editor.alert(
                $("#save-alert"),
                "alert-success",
                "Changes published."
              );
            }
          })
          .catch((err) => {
            editor.alert(
              $("#save-alert"),
              "alert-danger",
              "Something went wrong. Err: " + err
            );
          });
      } else if (episodeID == "new") {
        var newRef = editor.database.ref("/episodes").push();
        header.id = newRef.key;
        let updates = {};
        updates["unpublished/episodes/" + newRef.key] = header;
        updates["unpublished/episodeContents/" + newRef.key] = content;
        editor.database
          .ref()
          .update(updates)
          .then((res) => {
            window.location.href =
              "/episode.html?id=" + newRef.key + "&published=false";
          })
          .catch((err) => {
            editor.alert(
              $("#save-alert"),
              "alert-danger",
              "Something went wrong. Err: " + err
            );
          });
      }
    },
    // Fix problem!!!
    delete: function (
      episodes = "episodes/",
      episodeContent = "episodeContents/"
    ) {
      let episodeID = api.params.get("id");
      if (episodeID != "new") {
        editor.episode.save(
          "archive/episodes/",
          "archive/episodeContents/",
          function () {
            let updates = {};
            updates[episodes + episodeID] = null;
            updates[episodeContent + episodeID] = null;
            editor.database
              .ref()
              .update(updates)
              .then(() => {
                window.location.href = "/content.html";
              })
              .catch((err) => {
                editor.alert(
                  $("#save-alert"),
                  "alert-danger",
                  "Something went wrong. Err: " + err
                );
              });
          }
        );
      }
    },
  },
};
