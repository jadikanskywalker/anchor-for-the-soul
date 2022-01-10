var api = {
  blogID: null,
  cardHTML:
    '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card bg-light"> <div class="card-body"> <div class="card-words pb-2 mb-1"> <div class="d-flex justify-content-between align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title"></h5> <p class="card-text"></p> </div> <div class="mt-1 d-flex justify-content-between align-items-end"> <div>  <p class="card-date text-muted mb-0"></p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div>',
  exploreHTML:
    '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card text-white card-explore"> <a href="blog.html"> <div class="card-bg-img"></div> <div class="layer" > </div> <div class="card-body"> <button class="btn btn-outline-light">Explore Blog ></button> </div> </a> </div> </div>',
  cardLeadHTML:
    '<div class="col-12 col-md-12 offset-md-0 mt-1 mt-md-3 mb-4 px-0 px-md-2"><div class="card card-lead"> <div class="row no-gutters"> <div class="col-md-5"> <div class="card-bg-img"></div> <div class="layer"></div> </div> <div class="col-md-7"> <div class="card-body"> <div class="card-words pb-5"> <div class="d-flex align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title display-4 mb-3 mb-lg-4 pb-3"></h5> <p class="card-text ml-2"></p> </div> <div class="card-details"> <div>  <p class="card-date text-muted mt-1 mb-0">August 31, 2020</p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div> </div> </div>',
  database: firebase.database(),
  analytics: firebase.analytics(),
  //Content, Article, and Episode Page
  data: [],
  //Content Page
  dataFlat: [],
  dataUnpublished: [],
  dataFlatUnpublished: [],
  dataFlatBoth: [],
  params: new URLSearchParams(window.location.search),
  filters: {
    topic: "none",
    type: "none",
  },
  filterMenu: false,
  highestID: null,
  sizeCards: function (set) {
    let cards = $(set + " .card");
    let cardWords = $(set + " .card-words");
    let maxHeight = -1;
    cardWords.each(function () {
      if ($(this).height("auto").height() > maxHeight) {
        maxHeight = $(this).height();
      }
    });
    $(set + " .card-words").height(maxHeight);
    $(set + " .card-explore").height($(set + " .card:first-of-type").height());
    let card = 0;
    var showBlogs = setInterval(function () {
      if (card < cards.length) {
        cards.eq(card).css("opacity", "1");
        card++;
      } else {
        clearInterval(showBlogs);
      }
    }, 50);
  },
  sortByDate: function (data, type) {
    if (
      Array.isArray(data) &&
      Array.isArray(type) &&
      data.length == type.length
    ) {
      let alteredData = data;
      console.log(alteredData);
      let flatData = [];
      for (set in alteredData) {
        for (item in alteredData[set]) {
          alteredData[set][item].type = type[set];
          flatData.push(alteredData[set][item]);
        }
      }
      console.log(flatData);
      return flatData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .reverse();
    }
    return;
  },
  filter: function (data, leadCard = true, limit = null) {
    let filters = api.filters;
    if (data) {
      let topic = filters.topic && filters.topic != "none" ? true : false;
      let type = filters.type && filters.type != "none" ? true : false;
      if (!topic && !type) {
        api.populate(data, leadCard, limit);
        return;
      }
      let filteredData = [];
      for (var i = 0; i <= data.length - 1; i++) {
        if (
          ((topic && data[i].topic == filters.topic) || !topic) &&
          ((type && data[i].type == filters.type) || !type)
        ) {
          filteredData.push(data[i]);
        }
      }
      if (type && !topic) {
        api.populate(filteredData, leadCard);
      } else {
        api.populate(filteredData, false);
      }
    }
  },
  populate: function (data, leadCard = true, limit = null, filter = true) {
    let cardLeadHTML = api.cardLeadHTML;
    let cardHTML = api.cardHTML;
    $("#content").empty();
    $("#content-lead").empty();
    let num = leadCard ? 2 : 1;
    let end = limit && data.length > limit ? data.length - limit : 0;
    for (var i = data.length - 1; i >= end; i--) {
      var blog = data[i];
      if (i != data.length - 1 || !leadCard) {
        $("#content").append(cardHTML);
        var card = $("#content .card").eq(data.length - num - i);
        var dateTag = "";
      } else {
        $("#content-lead").append(cardLeadHTML);
        var card = $("#content-lead .card-lead");
        var dateTag = "<b>Newest</b> &bull; ";
      }
      card
        .find(".card-type")
        .html(
          '<img class="card-type-img" src="images/' +
            blog.type +
            '.svg" height="15px" width="15px">' +
            blog.type.charAt(0).toUpperCase() +
            blog.type.slice(1)
        )
        .attr("value", blog.type);
      card.find(".card-title").text(blog.title);
      card.find(".card-text").text(blog.description);
      card
        .find($(".card-topic"))
        .text(blog.topic.charAt(0).toUpperCase() + blog.topic.slice(1))
        .attr("value", blog.topic);
      card.find(".card-date").html(
        dateTag +
          new Date(blog.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
      );
      let btn = card.find(".btn");
      btn.attr("href", blog.type + ".html?id=" + blog.id);
      if (auth.editorStatus) {
        btn.text("Edit >");
        if (blog.published === "false") {
          card
            .find(".card-date")
            .before('<p class="text-info mb-0">&#10007; Unpublished</p>');
          btn.attr(
            "href",
            blog.type + ".html?id=" + blog.id + "&published=false"
          );
        } else {
          card
            .find(".card-date")
            .css("margin-bottom", "0.5rem")
            .before('<p class="text-success mb-0">&#10003; Published</p>');
        }
      } else if (blog.type == "episode") {
        btn.text("Listen >");
      }
    }
    if (leadCard) {
      $(".card-lead").show().css("opacity", 1);
    } else {
      $(".card-lead").hide();
    }
    api.cardClickhandlers(filter);
    $("#content-loading").hide();
    $(".main").show();
    api.sizeCards("#content");
    $(window).resize(function () {
      api.sizeCards("#content");
    });
  },
  contentInit: function (filter = true) {
    $.when(
      // Get Articles
      api.database
        .ref("blogs")
        .orderByKey()
        .limitToLast(100)
        .once("value")
        .then((snapshot) => {
          api.data[0] = snapshot.val() || null;
        }),
      // Get Episodes
      api.database
        .ref("episodes")
        .orderByKey()
        .limitToLast(100)
        .once("value")
        .then((snapshot) => {
          api.data[1] = snapshot.val() || null;
        })
    ).then(function () {
      api.analytics.logEvent("select_content", {
        content_type: "resources",
      });
      if (auth.editorStatus) {
        $("#clear-filters").after(
          '<select class="custom-select mx-2 mt-2" id="filter-published-select" style="width:150px""><option selected value="both">All Resources</option><option value="true">Published</option><option value="false">Unpublished</option></select><a class="btn btn-info mx-2" id="new-article" href="/article.html?id=new">+ New Article</a><a class="btn btn-info mx-2" id="new-episode" href="/episode.html?id=new">+ New Episode</a>'
        );
      } else {
        $("#new-article, #new-episode, #filter-published-select").remove();
      }
      api.dataFlat = api.sortByDate(api.data, ["article", "episode"]);
      if (filter) {
        let params = api.params;
        if (params.has("topic")) {
          api.filters.topic = params.get("topic");
          $("#filter-topic-select").val(params.get("topic"));
          $("#filters").show().css("opacity", 1);
          $(".filter-menu p").css("max-width", "7rem");
          api.filterMenu = true;
        }
        if (params.has("type")) {
          api.filters.type = params.get("type");
          $("#filter-type-select").val(params.get("type"));
        }
        if (auth.editorStatus) {
          if (params.has("published")) {
            api.filters.published = params.get("published");
            $("#filter-published-select").val(params.get("published"));
            if (api.filters.published === "false") {
              api.unpublishedContentInit("false");
            } else if (api.filters.published === "true") {
              api.unpublishedContentInit("true");
            } else {
              api.unpublishedContentInit("both");
            }
          } else {
            api.unpublishedContentInit("both");
          }
        } else {
          api.filter(api.dataFlat);
        }
        $(document).on(
          "change",
          "#filter-topic-select, #filter-type-select, #filter-published-select",
          function () {
            (api.filters.topic = $("#filter-topic-select").val()),
              (api.filters.type = $("#filter-type-select").val());
            if (auth.editorStatus) {
              api.filters.published = $("#filter-published-select").val();
              if (api.filters.published === "false") {
                api.filter(api.dataFlatUnpublished, false);
              } else if (api.filters.published === "true") {
                api.filter(api.dataFlat);
              } else {
                api.filter(api.dataFlatBoth);
              }
            } else {
              api.filter(api.dataFlat);
            }
          }
        );
        $("#clear-filters").click(function () {
          api.filters = {
            topic: "none",
            type: "none",
            published: "both",
          };
          $("#filter-topic-select").val("none"),
            $("#filter-type-select").val("none");
          $("#filter-published-select").val("both");
          $("#filters").animate(
            { opacity: 0, right: "1.1rem" },
            300,
            "swing",
            function () {
              $("#filters").hide();
            }
          );
          $(".filter-menu p").css("max-width", "");
          api.filterMenu = false;
          if (auth.editorStatus) {
            api.populate(api.dataFlatBoth);
          } else {
            api.populate(api.dataFlat);
          }
        });
        $(".filter-menu").click(function () {
          if (api.filterMenu) {
            $("#filters").animate(
              { opacity: 0, right: "1.1rem" },
              300,
              "swing",
              function () {
                $("#filters").hide();
              }
            );
            $(".filter-menu p").css("max-width", "");
          } else {
            $("#filters")
              .css("right", "1rem")
              .show()
              .animate({ opacity: 1, right: "1.3rem" }, 200);
            $(".filter-menu p").css("max-width", "7rem");
          }
          api.filterMenu = !api.filterMenu;
        });
        $(".filter-close").click(function () {
          $("#filters").animate(
            { opacity: 0, right: "1.1rem" },
            300,
            "swing",
            function () {
              $("#filters").hide();
            }
          );
          $(".filter-menu p").css("max-width", "");
          api.filterMenu = false;
        });
      } else {
        api.populate(api.dataFlat, true, null, false);
      }
    });
  },
  unpublishedContentInit: function (published = true) {
    Promise.all([
      api.database
        .ref("/unpublished/blogs/")
        .once("value")
        .then((snapshot) => {
          api.dataUnpublished[0] = snapshot.val() || null;
          console.log(api.dataUnpublished[0]);
        })
        .catch((err) => {
          console.log(err);
        }),
      api.database
        .ref("/unpublished/episodes/")
        .once("value")
        .then((snapshot) => {
          api.dataUnpublished[1] = snapshot.val() || null;
          console.log(api.dataUnpublished[1]);
        })
        .catch((err) => {
          console.log(err);
        }),
    ]).then(() => {
      for (i in api.dataUnpublished) {
        for (item in api.dataUnpublished[i]) {
          api.dataUnpublished[i][item].published = "false";
        }
      }
      api.dataFlatUnpublished = api.sortByDate(api.dataUnpublished, [
        "article",
        "episode",
      ]);
      api.dataFlatBoth = api.sortByDate(
        [
          api.dataUnpublished[0],
          api.data[0],
          api.dataUnpublished[1],
          api.data[1],
        ],
        ["article", "article", "episode", "episode"]
      );
      if (published === "true") {
        api.filter(api.dataFlat, true);
      } else if (published === "false") {
        api.filter(api.dataFlatUnpublished, false);
      } else {
        api.filter(api.dataFlatBoth);
      }
    });
  },
  cardClickhandlers: function (content = true) {
    if (content) {
      $(".card-topic").click(function () {
        let value = $(this).attr("value");
        if (value) {
          api.filters.topic = value;
          $("#filter-topic-select").val(value);
          if (!auth.editorStatus) {
            api.filter(api.dataFlat);
          } else {
            api.filter(api.dataFlatBoth);
          }

          if (!api.filterMenu) {
            $("#filters")
              .css("right", "1rem")
              .show()
              .animate({ opacity: 1, right: "1.3rem" }, 200);
            $(".filter-menu p").css("max-width", "7rem");
            api.filterMenu = true;
          }
        }
      });
      $(".card-type").click(function () {
        let value = $(this).attr("value");
        if (value) {
          api.filters.type = value;
          $("#filter-type-select").val(value);
          if (!auth.editorStatus) {
            api.filter(api.dataFlat);
          } else {
            api.filter(api.dataFlatBoth);
          }
          if (!api.filterMenu) {
            $("#filters")
              .css("right", "1rem")
              .show()
              .animate({ opacity: 1, right: "1.3rem" }, 200);
            $(".filter-menu p").css("max-width", "7rem");
            api.filterMenu = true;
          }
        }
      });
    } else {
      $(".card-topic, .article-topic, .podcast-topic").click(function () {
        window.location.href = "./content.html?topic=" + $(this).attr("value");
      });
      $(".card-type").click(function () {
        window.location.href = "./content.html?type=" + $(this).attr("value");
      });
    }
  },
  latestArticles: function (id) {
    api.database
      .ref("blogs")
      .orderByKey()
      .limitToLast(5)
      .once("value")
      .then((snapshot) => {
        var data = snapshot.val() || null;
        if (id) {
          console.log(data);
          for (key in data) {
            if (id == data[key].id) {
              delete data[key];
              break;
            }
          }
          console.log(data);
        }
        data = api.sortByDate([data], ["article"]);
        api.populate(data, false, 4, false);
      });
  },
  latestEpisodes: function (explore, id) {
    api.database
      .ref("episodes")
      .orderByKey()
      .limitToLast(5)
      .once("value")
      .then((snapshot) => {
        var data = snapshot.val() || null;
        if (id) {
          console.log(data);
          for (key in data) {
            if (id == data[key].id) {
              delete data[key];
              break;
            }
          }
          console.log(data);
        }
        data = api.sortByDate([data], ["episode"]);
        api.populate(data, false, 4, false);
      });
  },
  sizeArticleContent: function (tag = "article") {
    var height = {
      window: $(window).height(),
      navbar: $(".header").outerHeight(),
      articleHeader: $("." + tag + "header").outerHeight(),
    };
    $("." + tag + "-content").css(
      "min-height",
      height.window - height.navbar - height.articleHeader
    );
  },
  transformArticleText: function (text) {
    function getIndicesOf(searchStr, str, caseSensitive = false) {
      var searchStrLen = searchStr.length;
      if (searchStrLen == 0) {
        return [];
      }
      var startIndex = 0,
        index,
        indices = [];
      if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
      }
      while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
      }
      return indices;
    }

    var italics = getIndicesOf("/i", text);
    italics = Array.from(italics);
    var transformedText = text;

    var i = italics.length - 1;
    while (i > -1) {
      transformedText =
        text.substring(0, italics[i]) +
        "<i>" +
        transformedText.substring(italics[i] + 3);
      let index = italics[i];
      while (index < transformedText.length) {
        if (transformedText.charAt(index) == "/") {
          transformedText =
            transformedText.substring(0, index) +
            "</i>" +
            transformedText.substring(index + 1);
          break;
        }
        index++;
      }
      i--;
    }
    return transformedText;
  },
  article: function (id, preview = false) {
    api.database = firebase.database();
    let published = api.params.get("published");
    let blogs, blogContent;
    if (published === "false" && auth.editorStatus) {
      blogs = "/unpublished/blogs/" + id;
      blogContent = "/unpublished/blogContent/" + id;
    } else if (published === "false" && !auth.editorStatus) {
      window.location.href = "/content.html";
    } else {
      blogs = "/blogs/" + id;
      blogContent = "/blogContent/" + id;
    }
    $("#accessibility-color")
      .off()
      .click(function () {
        $("body").toggleClass("dark");
        $(".article-date, .article-description, .back-to-resources")
          .toggleClass("text-muted")
          .toggleClass("color-light");
        $(
          ".article-topic, .accessibility-color, .accessibility-size, .dropdown-menu, .accessibility-preview"
        ).toggleClass("dark");
        $(".accessibility-color img").toggleClass("d-none");
        $(".header-small").toggleClass("bg-transparent");
        $(".header .bottom-curve").toggle();
      });
    var sizeMenu = false;
    $("#accessibility-size")
      .off()
      .click(function () {
        console.log("triggered size");
        if (!sizeMenu) {
          $(this).next().fadeIn(100);
          sizeMenu = !sizeMenu;
        } else {
          $(this).next().fadeOut(100);
          sizeMenu = !sizeMenu;
        }
      });
    $(".article-accessibility-menu .dropdown-item")
      .off()
      .click(function () {
        var size = $(this).attr("size");
        if (size == "sm") {
          $(".main").css("font-size", "90%");
        } else if (size == "md") {
          $(".main").css("font-size", "100%");
        } else {
          $(".main").css("font-size", "110%");
        }
      });
    if (id !== "new") {
      api.database.ref(blogs).on("value", (snapshot) => {
        api.data = snapshot.val() || null;
        document.title = api.data.title;
        if (!auth.editorStatus) {
          api.analytics.logEvent("select_item", {
            item_id: api.data.id,
            item_name: api.data.title,
            item_list_name: "Articles",
          });
        }
        if (!auth.editorStatus || preview) {
          // Display existing article
          $(".user").show();
          $(".editor-only").hide();
          api.blogID = id;
          $(".article-title").text(api.data.title);
          $(".article-topic")
            .text(
              api.data.topic.charAt(0).toUpperCase() + api.data.topic.slice(1)
            )
            .attr("value", api.data.topic)
            .show();
          api.cardClickhandlers(false);
          $(".article-description").text(api.data.description);
          $(".article-date").text(
            new Date(api.data.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
          $(".article-header").css("opacity", "1");
        } else {
          // Edit existing article
          $(".user").hide();
          $(".editor-only").show();
          $("#article-title").html(api.data.title);
          $("#article-topic").val(api.data.topic).show();
          $("#article-description").html(api.data.description);
          $("#article-date").val(api.data.date);
          if (published === "false") {
            $("#editor-article-publish").show();
            $("#editor-article-published").hide();
            $("#editor-article-unpublish").hide();
          }
          $(".article-header").css("opacity", "1");
        }
        api.sizeArticleContent();
        $(window).resize(function () {
          api.sizeArticleContent();
        });
        $("#article-loading").hide();
        $(".main").fadeIn();
      });
      api.database.ref(blogContent).on("value", (snapshot) => {
        api.dataContent = snapshot.val() || null;
        var contentColumn = $(".article-content-column");
        var key;
        contentColumn.empty();
        if (auth.editorStatus && !preview) {
          contentColumn.append(
            "<div class='editor-top'><div class='content-top' style='width:100%;' id='-1'></div>" +
              '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="-1">+</button> </div>' +
              "</div>"
          );
        }
        if (api.dataContent) {
          api.highestID = api.dataContent.length - 1;
          let object;
          for (var i = 0; i < api.dataContent.length; i++) {
            key = Object.keys(api.dataContent[i])[0];
            if (!auth.editorStatus || preview) {
              object = api.transformArticleText(api.dataContent[i][key]);
              contentColumn.append("<" + key + ">" + object + "</" + key + ">");
            } else {
              if (key == "p") {
                contentColumn.append(
                  "<div class='editor-editable'><div contenteditable id='" +
                    i +
                    "'  type='" +
                    key +
                    "' class='bg-light content-editable' style='width:100%;'>" +
                    api.dataContent[i][key] +
                    "</div><button class='editor-delete text-muted' placeid='" +
                    i +
                    "'>x</button>" +
                    '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
                    i +
                    '">+</button> </div>' +
                    "</div>"
                );
              } else {
                contentColumn.append(
                  "<div class='editor-input'><input id='" +
                    i +
                    "' type='" +
                    key +
                    "' value='" +
                    api.dataContent[i][key] +
                    "' class='bg-light " +
                    key +
                    "' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
                    i +
                    "'>x</button>" +
                    '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
                    i +
                    '">+</button> </div>' +
                    "<div>"
                );
              }
              contentColumn.append();
            }
          }
        }
        $(".article-content").css("opacity", "1");
        if (auth.editorStatus && !preview) {
          editor.init();
        }
      });
    } else if (id == "new") {
      if (auth.editorStatus) {
        // Create New Article Template
        $(".user").hide();
        $(".editor-only").show();
        $("#article-title").html("Title");
        $("#article-topic").show();
        $("#article-description").html("Description");
        $("#article-date").val(
          new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, -1)
        );
        $(".article-header").css("opacity", "1");
        $("#editor-article-delete").hide();
        $("#editor-article-published").hide();
        $("#editor-article-unpublish").hide();
        var contentColumn = $(".article-content-column");
        api.highestID = 1;
        contentColumn.empty();
        contentColumn.append(
          "<div class='editor-top'><div class='content-top' style='width:100%;' id='-1'></div>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="-1">+</button> </div>' +
            "</div>"
        );
        contentColumn.append(
          "<div class='editor-input'><input id='0' type='h3' value='Header' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='0'>x</button>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="0">+</button> </div>' +
            "<div>"
        );
        contentColumn.append(
          "<div class='editor-editable'><div contenteditable id='1'  type='p' class='bg-light content-editable' style='width:100%;'>Paragraph</div><button class='editor-delete text-muted' placeid='1'>x</button>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="1">+</button> </div>' +
            "</div>"
        );
        $(".article-content").css("opacity", "1");
        editor.init();
        $("#article-loading").hide();
        api.sizeArticleContent();
        $(window).resize(function () {
          api.sizeArticleContent();
        });
      } else {
        window.location.href = "/content.html";
      }
    }
  },
  getAudio: function (pid) {
    let rssLink = "https://anchor.fm/s/2e7af980/podcast/rss";
    let audioLink = "";
    $.ajax({
      type: "GET",
      url: rssLink,
      dataType: "xml",
      error: function (e) {
        console.log("XML reading Failed: ", e);
      },
      success: function (data) {
        var xml = new XMLSerializer().serializeToString(data);
        var xmlDoc = $.parseXML(xml);
        var xml = $(xmlDoc);
        var items = xml.find("item");
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var link = $(item).find("link").text();
          var id = "";
          for (var j = link.length - 1; j >= 0; j--) {
            if (link[j] == "-") {
              break;
            } else {
              id = link[j] + id;
            }
          }
          if (pid === id) {
            audioLink = xml.find("enclosure").attr("url");
          }
        }
        $("audio").attr("src", audioLink);
        $(".episode-pid").val(pid);
      },
    });
  },
  episode: function (id, preview = false) {
    api.database = firebase.database();
    let published = api.params.get("published");
    let episodes, episodeContent;
    if (published === "false" && auth.editorStatus) {
      episodes = "/unpublished/episodes/" + id;
      episodeContent = "/unpublished/episodeContent/" + id;
    } else if (published === "false" && !auth.editorStatus) {
      window.location.href = "/content.html";
    } else {
      episodes = "/episodes/" + id;
      episodeContent = "/episodeContent/" + id;
    }
    $("#accessibility-color")
      .off()
      .click(function () {
        $("body").toggleClass("dark");
        $(".episode-date, .episode-description, .back-to-resources")
          .toggleClass("text-muted")
          .toggleClass("color-light");
        $(
          ".episode-topic, .accessibility-color, .accessibility-size, .dropdown-menu, .accessibility-preview"
        ).toggleClass("dark");
        $(".accessibility-color img").toggleClass("d-none");
        $(".header-small").toggleClass("bg-transparent");
        $(".header .bottom-curve").toggle();
      });
    var sizeMenu = false;
    $("#accessibility-size")
      .off()
      .click(function () {
        console.log("triggered size");
        if (!sizeMenu) {
          $(this).next().fadeIn(100);
          sizeMenu = !sizeMenu;
        } else {
          $(this).next().fadeOut(100);
          sizeMenu = !sizeMenu;
        }
      });
    $(".episode-accessibility-menu .dropdown-item")
      .off()
      .click(function () {
        var size = $(this).attr("size");
        if (size == "sm") {
          $(".main").css("font-size", "90%");
        } else if (size == "md") {
          $(".main").css("font-size", "100%");
        } else {
          $(".main").css("font-size", "110%");
        }
      });
    if (id != "new") {
      api.database.ref(episodes).on("value", (snapshot) => {
        api.data = snapshot.val() || null;
        console.log(api.data);
        document.title = api.data.title;
        if (!auth.editorStatus) {
          api.analytics.logEvent("select_item", {
            item_id: api.data.id,
            item_name: api.data.title,
            item_list_name: "Episodes",
          });
        }
        if (!auth.editorStatus || preview) {
          $(".user").show();
          $(".editor-only").hide();
          $(".episode-date").text(
            new Date(api.data.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
          $(".episode-topic")
            .text(
              api.data.topic.charAt(0).toUpperCase() + api.data.topic.slice(1)
            )
            .attr("value", api.data.topic)
            .addClass(["bg-dark", "text-white"])
            .show();
          api.cardClickhandlers(false);
          $(".episode-title").text(api.data.title);
          $(".episode-description").text(api.data.description);
        } else {
          $(".editor-only").show();
          $(".user").hide();
          $("#episode-date").val(api.data.date);
          $("#episode-topic").val(api.data.topic).show();
          $("#episode-title").text(api.data.title);
          $("#episode-description").text(api.data.description);
          if (published === "false") {
            $("#editor-episode-publish").show();
            $("#editor-episode-published").hide();
            $("#editor-episode-unpublish").hide();
          } else {
            $("#editor-episode-publish").hide();
            $("#editor-episode-published").show();
            $("#editor-episode-unpublish").show();
          }
          $("#episode-go")
            .off()
            .click(() => {
              let newPid = $(".episode-pid").val();
              api.getAudio(newPid);
            });
        }
        api.sizeArticleContent("episode");
        $(window).resize(function () {
          api.sizeArticleContent("episode");
        });
        $(".episode-details").css("opacity", 1);
        api.getAudio(api.data.pid);
        $(".episode-content").css("opacity", "1");
        if (auth.editorStatus) {
          editor.init();
        }
      });
      api.database.ref(episodeContent).on("value", (snapshot) => {
        api.dataContent = snapshot.val() || null;
        var contentColumn = $(".episode-content-column");
        var key;
        contentColumn.empty();
        if (auth.editorStatus && !preview) {
          contentColumn.append(
            "<div class='editor-top'><div class='content-top' style='width:100%;' id='-1'></div>" +
              '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="-1">+</button> </div>' +
              "</div>"
          );
        }
        if (api.dataContent) {
          api.highestID = api.dataContent.length - 1;
          let object;
          for (var i = 0; i < api.dataContent.length; i++) {
            key = Object.keys(api.dataContent[i])[0];
            if (!auth.editorStatus || preview) {
              object = api.transformArticleText(api.dataContent[i][key]);
              contentColumn.append("<" + key + ">" + object + "</" + key + ">");
            } else {
              if (key == "p") {
                contentColumn.append(
                  "<div class='editor-editable'><div contenteditable id='" +
                    i +
                    "'  type='" +
                    key +
                    "' class='bg-light content-editable' style='width:100%;'>" +
                    api.dataContent[i][key] +
                    "</div><button class='editor-delete text-muted' placeid='" +
                    i +
                    "'>x</button>" +
                    '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
                    i +
                    '">+</button> </div>' +
                    "</div>"
                );
              } else {
                contentColumn.append(
                  "<div class='editor-input'><input id='" +
                    i +
                    "' type='" +
                    key +
                    "' value='" +
                    api.dataContent[i][key] +
                    "' class='bg-light " +
                    key +
                    "' style='width:100%;'> <button class='editor-delete text-muted' placeid='" +
                    i +
                    "'>x</button>" +
                    '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' +
                    i +
                    '">+</button> </div>' +
                    "<div>"
                );
              }
              contentColumn.append();
            }
          }
        }
        $(".episode-content").css("opacity", "1");
        if (auth.editorStatus && !preview) {
          editor.init();
        }
      });
    } else {
      if (auth.editorStatus) {
        // Create New Episode Template
        $(".user").hide();
        $(".editor-only").show();
        $("#episode-title").html("Title");
        $("#episode-topic").show();
        $("#episode-description").html("Description");
        $("#episode-date").val(
          new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, -1)
        );
        $(".episode-header").css("opacity", "1");
        $("#editor-episode-delete").hide();
        $("#editor-episode-published").hide();
        $("#editor-episode-unpublish").hide();
        $("#episode-go")
          .off()
          .click(() => {
            let newPid = $(".episode-pid").val();
            api.getAudio(newPid);
          });
        var contentColumn = $(".episode-content-column");
        api.highestID = 1;
        contentColumn.empty();
        contentColumn.append(
          "<div class='editor-top'><div class='content-top' style='width:100%;' id='-1'></div>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="-1">+</button> </div>' +
            "</div>"
        );
        contentColumn.append(
          "<div class='editor-input'><input id='0' type='h3' value='Header' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='0'>x</button>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="0">+</button> </div>' +
            "<div>"
        );
        contentColumn.append(
          "<div class='editor-editable'><div contenteditable id='1'  type='p' class='bg-light content-editable' style='width:100%;'>Paragraph</div><button class='editor-delete text-muted' placeid='1'>x</button>" +
            '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="1">+</button> </div>' +
            "</div>"
        );
        $(".episode-content").css("opacity", "1");
        editor.init();
        $("#episode-loading").hide();
        api.sizeArticleContent("episode");
        $(window).resize(function () {
          api.sizeArticleContent("episode");
        });
      } else {
        window.location.href = "/content.html";
      }
    }
  },
};
