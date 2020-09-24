var editor = {
  database: null,
  init: function() {
    var pathname = window.location.pathname;

    editor.database = firebase.database();

    if (pathname.startsWith('/article')) {
      editor.article.setClickhandlers();
    } else if (pathname.startsWith('/episode')) {
      editor.episode.setClickhandlers();
    }
  },
  alert: function(item, addClass, text) {
    console.log('alert');
    item.removeClass(['alert-danger', 'alert-success']).addClass(addClass).text(text).fadeIn();
    var alert = window.setTimeout(function() {
      item.fadeOut();
    }, 2000);
  },
  article: {
    setClickhandlers: function() {
      var id;
      $('.editor-delete').off().click(function() {
        id = $(this).attr('placeid');
        $('#modal-delete').modal('show');
      });
      $('.editor-add').off().click(function() {
        id = $(this).attr('placeid');
        $('#modal-add').modal('show');
      });
      $('#modal-delete .modal-confirm').off().click(function() {
        $('#modal-delete').modal('hide');
        editor.article.deleteSection(id);
      });
      $('#modal-add .modal-confirm').off().click(function() {
        $('#modal-add').modal('hide');
        let style = $('input[name="style"]:checked').val();
        editor.article.addSection(id, style);
      });
      $('#modal-delete-article .modal-confirm').off().click(function() {
        editor.article.delete();
      });
      $('#editor-article-save').off().click(function() {
        editor.article.save();
      });
      $('#editor-article-delete').off().click(function() {
        $('#modal-delete-article').modal('show');
      });
    },
    deleteSection: function(id) {
      $('#' + id).parent().remove();
    },
    addSection: function(startID, style) {
      let content;
      api.highestID++;
      if (style == "p") {
        content = "<div class='editor-editable'><div contenteditable id='" + api.highestID + "'  type='p' class='bg-light content-editable' style='width:100%;'> </div> <button class='editor-delete text-muted' placeid='" + api.highestID + "'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' + api.highestID + '">+</button> </div>' + "</div>";
      } else {
        content = "<div class='editor-input'><input id='" + api.highestID + "' type='h3' value='' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='" + api.highestID + "'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' + api.highestID + '">+</button> </div>' + "<div>";
      }
      $('#' + startID).parent().after(content);
      editor.article.setClickhandlers();
    },
    save: function(blogs = 'blogs/', blogContent = 'blogContent/', callback = null) {
      let articleID = api.params.get('id');
      // Article Header
      let header = {
        date: $('#article-date').val(),
        title: $('#article-title').text(),
        id: articleID,
        description: $('#article-description').text(),
        topic: $('#article-topic').val()
      }
      // Article Content
      var feilds = $('#article-content').children();
      var content = {};
      var current, key, value, indexStr;
      var num = 0;
      feilds.each(function(index) {
        console.log(index);
        if ($(this).hasClass('editor-editable')) {
          console.log('in 1');
          current = $(this).find('div.content-editable');
          key = current.attr('type');
          value = current.text();
        } else if ($(this).hasClass('editor-input')) {
          console.log('in 2');
          current = $(this).find('input');
          key = current.attr('type');
          value = current.val();
        }
        
        indexStr = num.toString();
        console.log(key, value);
        if (key == 'p' || key == 'h3' && value.length > 1) {
          content[indexStr] = {}
          content[indexStr][key] =  value;
          num++;
        }
        console.log(content);
      });
      console.log(content);
      // Update Database
      if (articleID != 'new') {
        console.log('in first one');
        let updates = {};
        updates[blogs + articleID] = header;
        updates[blogContent + articleID] = content;
        editor.database.ref().update(updates).then((res) => {
          editor.alert($('#save-alert'), 'alert-success', 'Changes saved.');
          if (callback) {
            callback();
          }
        }).catch((err) => {
          editor.alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
        });
      } else if (articleID == 'new') {
        var newRef = editor.database.ref('blogs/').push();
        header.id = newRef.key;
        let updates = {}
        updates['blogs/' + newRef.key] = header;
        updates['blogContent/' + newRef.key] = content;
        console.log(updates);
        editor.database.ref().update(updates).then((res) => {
          window.location.href = '/content.html';
        }).catch((err) => {
          editor.alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
        });
      }
    },
    delete: function() {
      let articleID = api.params.get('id');
      if (articleID != 'new') {
        editor.article.save('blogsArchive/', 'blogContentArchive/', function() {
          let updates = {};
          updates['blogs/' + articleID] = null;
          updates['blogContent/' + articleID] = null;
          editor.database.ref().update(updates).then(() => {
            window.location.href = '/content.html';
          }).catch((err) => {
            editor.alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
          });
        });
      }
    }
  },
  episode: {
    setClickhandlers: function() {
      $('#editor-episode-save').off().click(function() {
        editor.episode.save();
      });
      $('#modal-delete-episode .modal-confirm').off().click(function() {
        editor.episode.delete();
      });
      $('#editor-episode-delete').off().click(function() {
        $('#modal-delete-episode').modal('show');
      });
    },
    save: function(podcasts = 'podcasts/', callback = null) {
      let episodeID = api.params.get('id');
      let header = {
        date: $('#podcast-date').val(),
        title: $('#podcast-title').text(),
        id: episodeID,
        description: $('#podcast-description').text(),
        topic: $('#podcast-topic').val(),
        url: $('#podcast-url').val()
      }
      if (episodeID != 'new') {
        console.log('in first one');
        let updates = {};
        updates[podcasts + episodeID] = header;
        editor.database.ref().update(updates).then((res) => {
          editor.alert($('#save-alert'), 'alert-success', 'Changes saved.');
          if (callback) {
            callback();
          }
        }).catch((err) => {
          editor.alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
        });
      } else if (episodeID == 'new') {
        console.log('in second one');
        var newRef = editor.database.ref('podcasts/').push();
        header.id = newRef.key;
        let updates = {}
        updates['podcasts/' + newRef.key] = header;
        console.log(updates);
        editor.database.ref().update(updates).then((res) => {
          window.location.href = '/content.html';
        }).catch((err) => {
          alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
        });
      }
    },
    delete: function() {
      let episodeID = api.params.get('id');
      if (episodeID != 'new') {
        editor.episode.save('podcastsArchive/', function() {
          let updates = {};
          updates['podcasts/' + episodeID] = null;
          editor.database.ref().update(updates).then(() => {
            window.location.href = '/content.html';
          }).catch((err) => {
            editor.alert($('#save-alert'), 'alert-danger', 'Something went wrong. Err: ' + err);
          });
        });
      }
    }
  }
}