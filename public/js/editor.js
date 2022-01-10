var editor = {
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
              "unpublished/blogs/",
              "unpublished/blogContent/"
            );
          } else {
            editor.article.delete();
          }
        });
      $("#editor-article-save")
        .off()
        .click(function () {
          let published = new URLSearchParams(window.location.search).get(
            "published"
          );
          if (published !== "false") {
            editor.article.save();
          } else {
            editor.article.save(
              "unpublished/blogs/",
              "unpublished/blogContent/",
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
      $("#editor-article-publish")
        .off()
        .click(function () {
          editor.article.save(
            "blogs/",
            "blogContent/",
            function () {
              let articleID = api.params.get("id");
              let updates = {};
              updates["unpublished/blogs/" + articleID] = null;
              updates["unpublished/blogContent/" + articleID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-article-publish").hide();
                  $("#editor-article-unpublish").show();
                  $("#editor-article-published").show();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/article.html?id=" + api.params.get("id")
                  );
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
      $("#editor-article-unpublish")
        .off()
        .click(function () {
          editor.article.save(
            "unpublished/blogs/",
            "unpublished/blogContent/",
            function () {
              let articleID = api.params.get("id");
              let updates = {};
              updates["blogs/" + articleID] = null;
              updates["blogContent/" + articleID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-article-publish").show();
                  $(
                    "#editor-article-published, #editor-article-unpublish"
                  ).hide();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/article.html?id=" +
                      api.params.get("id") +
                      "&published=false"
                  );
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
      $("#editor-article-delete")
        .off()
        .click(function () {
          $("#modal-delete-article").modal("show");
        });
      $("#accessibility-preview").click(function () {
        console.log("triggered preview");
        api.article(api.params.get("id"), true);
      });
      $("#accessibility-preview-2")
        .show()
        .click(function () {
          console.log("triggered preview");
          api.article(api.params.get("id"));
          if ($("body").hasClass("dark")) {
            $("#accessibility-color").click();
          }
          $('.dropdown-menu .dropdown-item[size="md"]').click();
        });
    },
    deleteSection: function (id) {
      if ($("#article-content > div").length > 1) {
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
      blogs = "blogs/",
      blogContent = "blogContent/",
      callback = null,
      publish = false
    ) {
      let articleID = api.params.get("id");
      // Article Header
      let header = {
        date: $("#article-date").val(),
        title: $("#article-title").text(),
        id: articleID,
        description: $("#article-description").text(),
        topic: $("#article-topic").val(),
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
      var feilds = $("#article-content").children();
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
        updates[blogs + articleID] = header;
        updates[blogContent + articleID] = content;
        editor.database
          .ref()
          .update(updates)
          .then((res) => {
            if (callback) {
              callback();
              if (publish) {
                $("#article-date").val(currentDate);
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
        var newRef = editor.database.ref("blogs/").push();
        header.id = newRef.key;
        let updates = {};
        updates["unpublished/blogs/" + newRef.key] = header;
        updates["unpublished/blogContent/" + newRef.key] = content;
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
    delete: function (blogs = "blogs/", blogContent = "blogContent/") {
      let articleID = api.params.get("id");
      if (articleID != "new") {
        editor.article.save(
          "blogsArchive/",
          "blogContentArchive/",
          function () {
            let updates = {};
            updates[blogs + articleID] = null;
            updates[blogContent + articleID] = null;
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
              "unpublished/episodeContent/"
            );
          } else {
            editor.episode.delete();
          }
        });
      $("#editor-episode-save")
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
              "unpublished/episodeContent/",
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
      $("#editor-episode-publish")
        .off()
        .click(function () {
          editor.episode.save(
            "episodes/",
            "episodeContent/",
            function () {
              let episodeID = api.params.get("id");
              let updates = {};
              updates["unpublished/episodes/" + episodeID] = null;
              updates["unpublished/episodeContent/" + episodeID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-episode-publish").hide();
                  $("#editor-episode-unpublish").show();
                  $("#editor-episode-published").show();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/episode.html?id=" + api.params.get("id")
                  );
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
      $("#editor-episode-unpublish")
        .off()
        .click(function () {
          editor.episode.save(
            "unpublished/episodes/",
            "unpublished/episodeContent/",
            function () {
              let episodeID = api.params.get("id");
              let updates = {};
              updates["episodes/" + episodeID] = null;
              updates["episodeContent/" + episodeID] = null;
              editor.database
                .ref()
                .update(updates)
                .then(function () {
                  $("#editor-episode-publish").show();
                  $(
                    "#editor-episode-published, #editor-episode-unpublish"
                  ).hide();
                  window.history.replaceState(
                    {},
                    document.title,
                    "/episode.html?id=" +
                      api.params.get("id") +
                      "&published=false"
                  );
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
      $("#editor-episode-delete")
        .off()
        .click(function () {
          $("#modal-delete-episode").modal("show");
        });
      $("#accessibility-preview")
        .off()
        .click(function () {
          console.log("triggered preview");
          api.episode(api.params.get("id"), true);
        });
      $("#accessibility-preview-2")
        .off()
        .show()
        .click(function () {
          console.log("triggered preview");
          api.episode(api.params.get("id"));
          if ($("body").hasClass("dark")) {
            $("#accessibility-color").click();
          }
          $('.dropdown-menu .dropdown-item[size="md"]').click();
        });
    },
    deleteSection: function (id) {
      if ($("#episode-content > div").length > 1) {
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
      episodeContent = "episodeContent/",
      callback = null,
      publish = false
    ) {
      let episodeID = api.params.get("id");
      // Episode Header
      let header = {
        date: $("#episode-date").val(),
        title: $("#episode-title").text(),
        id: episodeID,
        description: $("#episode-description").text(),
        topic: $("#episode-topic").val(),
        pid: $("#episode-pid").val(),
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
      var feilds = $("#episode-content").children();
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
                $("#episode-date").val(currentDate);
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
        updates["unpublished/episodeContent/" + newRef.key] = content;
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
    delete: function (
      episodes = "episodes/",
      episodeContent = "episodeContent/"
    ) {
      let episodeID = api.params.get("id");
      if (episodeID != "new") {
        editor.episode.save(
          "episodesArchive/",
          "episodeContentArchive/",
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
