var api = {
  itemID: null,
  cardHTML:
    '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card bg-light"> <div class="card-body"> <div class="card-words pb-2 mb-1"> <div class="d-flex justify-content-between align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title"></h5> <p class="card-text"></p> </div> <div class="mt-1 d-flex justify-content-between align-items-end"> <div>  <p class="card-date text-muted mb-0"></p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div>',
  cardLeadHTML:
    '<div class="col-12 col-md-12 offset-md-0 mt-1 mt-md-3 mb-4 px-0 px-md-2"><div class="card card-lead"> <div class="row no-gutters"> <div class="col-md-5"> <div class="card-bg-img"></div> <div class="layer"></div> </div> <div class="col-md-7"> <div class="card-body"> <div class="card-words pb-5"> <div class="d-flex align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title display-4 mb-3 mb-lg-4 pb-3"></h5> <p class="card-text ml-2"></p> </div> <div class="card-details"> <div>  <p class="card-date text-muted mt-1 mb-0">August 31, 2020</p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div> </div> </div>',
  database: firebase.database(),
  analytics: firebase.analytics(),
  // Data variable for Content, Article, and Episode Page
  data: [],
  // Data variable for Content Page (to show unpublished content to editors)
  dataFlat: [],
  dataUnpublished: [],
  dataFlatUnpublished: [],
  dataFlatBoth: [],
  params: new URLSearchParams(window.location.search),
  filters: {
    topic: "none",
    type: "none",
  },
  filterMenu: false, // is visible?
  highestID: null,
  /* Card sizing (and displaying) function
   *    - Recieves parent elements id as argument, eg. set = "#content", "#latestEpisodes", or "#latestArticles" */
  sizeCards: function (set) {
    let cards = $(set + " .card");
    let cardWords = $(set + " .card-words");
    let maxHeight = -1;
    // Find max height
    cardWords.each(function () {
      if ($(this).height("auto").height() > maxHeight) {
        maxHeight = $(this).height();
      }
    });
    // Make all max height
    $(set + " .card-words").height(maxHeight);
    // Cascade appearance of items
    let card = 0;
    var showItems = setInterval(function () {
      if (card < cards.length) {
        cards.eq(card).css("opacity", "1");
        card++;
      } else {
        clearInterval(showItems);
      }
    }, 50);
  },
  /* Card sorting
   *    - takes array of data arrays, followed by array of respective type strings
   *        Eg. data =  [ [articles], [unpublished articles], [episodes], [unpublished episodes] ],
   *            type =  [ "article",        "article",        "episode",         "episode"       ] */
  sortByDate: function (data, type) {
    if (
      Array.isArray(data) &&
      Array.isArray(type) &&
      data.length == type.length
    ) {
      // Flatten data
      let alteredData = data;
      let flatData = [];
      for (set in alteredData) {
        for (item in alteredData[set]) {
          alteredData[set][item].type = type[set];
          flatData.push(alteredData[set][item]);
        }
      }
      // Sort and return flattened data
      return flatData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .reverse();
    }
    return;
  },
  // Card filtering middleware (passes on parameters to api.populate())
  filter: function (data, leadCard = true, limit = null) {
    let filters = api.filters;
    if (data) {
      let topic = filters.topic && filters.topic != "none" ? true : false;
      let type = filters.type && filters.type != "none" ? true : false;
      // If no filters, pass data and conditions through
      if (!topic && !type) {
        api.populate(data, leadCard, limit);
        return;
      }
      // Filter data
      let filteredData = [];
      for (var i = 0; i <= data.length - 1; i++) {
        if (
          ((topic && data[i].topic == filters.topic) || !topic) &&
          ((type && data[i].type == filters.type) || !type)
        ) {
          filteredData.push(data[i]);
        }
      }
      // Pass on data, show lead card only for type filter
      if (type && !topic) {
        api.populate(filteredData, leadCard);
      } else {
        api.populate(filteredData, false);
      }
    }
  },
  // Functions to create card HTML and display content
  populate: function (data, leadCard = true, limit = null, filter = true) {
    let cardLeadHTML = api.cardLeadHTML;
    let cardHTML = api.cardHTML;
    $("#content").empty();
    $("#content-lead").empty();
    let num = leadCard ? 2 : 1;
    let end = limit && data.length > limit ? data.length - limit : 0;
    // Loop through data to create card HTML for each item
    for (var i = data.length - 1; i >= end; i--) {
      let item = data[i];
      // Create element
      if (i != data.length - 1 || !leadCard) {
        $("#content").append(cardHTML);
        var card = $("#content .card").eq(data.length - num - i);
        var dateTag = "";
      } else {
        $("#content-lead").append(cardLeadHTML);
        var card = $("#content-lead .card-lead");
        var dateTag = "<b>Newest</b> &bull; ";
      }
      // Fill card
      card
        .find(".card-type")
        .html(
          '<img class="card-type-img" src="images/' +
            item.type +
            '.svg" height="15px" width="15px">' +
            item.type.charAt(0).toUpperCase() +
            item.type.slice(1)
        )
        .attr("value", item.type);
      card.find(".card-title").text(item.title);
      card.find(".card-text").text(item.description);
      card
        .find($(".card-topic"))
        .text(item.topic.charAt(0).toUpperCase() + item.topic.slice(1))
        .attr("value", item.topic);
      card.find(".card-date").html(
        dateTag +
          new Date(item.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
      );
      let btn = card.find(".btn");
      btn.attr("href", item.type + ".html?id=" + item.id);
      // Special buttons and links for editors
      if (auth.editorStatus) {
        btn.text("Edit >");
        if (item.published === "false") {
          card
            .find(".card-date")
            .before('<p class="text-info mb-0">&#10007; Unpublished</p>');
          btn.attr(
            "href",
            item.type + ".html?id=" + item.id + "&published=false"
          );
        } else {
          card
            .find(".card-date")
            .css("margin-bottom", "0.5rem")
            .before('<p class="text-success mb-0">&#10003; Published</p>');
        }
      } else if (item.type == "episode") {
        btn.text("Listen >");
      }
    }
    if (leadCard) {
      $(".card-lead").show().css("opacity", 1);
    } else {
      $(".card-lead").hide();
    }
    // Set card clickhandlers, size cards, show content
    api.cardClickhandlers(filter);
    $("#content-loading").hide();
    $('.content-footer').show();
    api.sizeCards("#content");
    $(window).resize(function () {
      api.sizeCards("#content");
    });
  },
  // (Main) Function to display published content
  contentInit: function (filter = true) {
    $.when(
      // Get Articles
      api.database
        .ref("articles")
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
      // Add filter options for editors
      if (auth.editorStatus) {
        $("#clear-filters").after(
          '<select class="custom-select mx-2 mt-2" id="filter-published-select" style="width:150px""><option selected value="both">All Resources</option><option value="true">Published</option><option value="false">Unpublished</option></select><a class="btn btn-info mx-2" id="new-article" href="/article.html?id=new">+ New Article</a><a class="btn btn-info mx-2" id="new-episode" href="/episode.html?id=new">+ New Episode</a>'
        );
      } else {
        $("#new-article, #new-episode, #filter-published-select").remove();
      }
      // Sort data
      api.dataFlat = api.sortByDate(api.data, ["article", "episode"]);
      // If on Content page...
      if (filter) {
        // Get URL filters
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
        // Catch and handle filter inputs
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
        // Clear filters
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
        // Handle filter menu vsibility
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
        // if on index page... (no filters)
        api.populate(api.dataFlat, true, null, false);
      }
    });
  },
  // Function to display unpublished content to editors
  unpublishedContentInit: function (published = true) {
    Promise.all([
      // Get unpublished articles
      api.database
        .ref("/unpublished/articles/")
        .once("value")
        .then((snapshot) => {
          api.dataUnpublished[0] = snapshot.val() || null;
        })
        .catch((err) => {
          console.log(err);
        }),
      // Get unpublished episodes
      api.database
        .ref("/unpublished/episodes/")
        .once("value")
        .then((snapshot) => {
          api.dataUnpublished[1] = snapshot.val() || null;
        })
        .catch((err) => {
          console.log(err);
        }),
    ]).then(() => {
      // Set published to false
      for (i in api.dataUnpublished) {
        for (item in api.dataUnpublished[i]) {
          api.dataUnpublished[i][item].published = "false";
        }
      }
      // Sort Data
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
      // Show content based on "Published" filter
      if (published === "true") {
        api.filter(api.dataFlat, true);
      } else if (published === "false") {
        api.filter(api.dataFlatUnpublished, false);
      } else {
        api.filter(api.dataFlatBoth);
      }
    });
  },
  // Set card clickhandlers function
  cardClickhandlers: function (content = true) {
    if (content) {
      // If card topic buttons pressed, display all items with that topic
      $(".card-topic").click(function () {
        let value = $(this).attr("value");
        if (value) {
          // Set topic as filter, filter data, redisplay it
          api.filters.topic = value;
          $("#filter-topic-select").val(value);
          if (!auth.editorStatus) {
            api.filter(api.dataFlat);
          } else {
            api.filter(api.dataFlatBoth);
          }
          // Show filter menu is not visible
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
      // Same for card type button
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
      // If on another page, redirect to content page to show all items with same topic/type
      $(".card-topic, .article-topic, .podcast-topic").click(function () {
        window.location.href = "./content.html?topic=" + $(this).attr("value");
      });
      $(".card-type").click(function () {
        window.location.href = "./content.html?type=" + $(this).attr("value");
      });
    }
  },
  // Display latest items on Article or Episode page
  latestItems: function (id, type) {
    // takes database route, type = "article" or "episode"
    api.database
      .ref(type + "s")
      .orderByKey()
      .limitToLast(5)
      .once("value")
      .then((snapshot) => {
        var data = snapshot.val() || null;
        // Remove current article from data
        if (id) {
          for (key in data) {
            if (id == data[key].id) {
              delete data[key];
              break;
            }
          }
        }
        data = api.sortByDate([data], [type]);
        // Sort and display most recent 4 articles (excluding current article)
        api.populate(data, false, 4, false);
      });
  },
  // On Article or Episode page, size content if item length shorter than window
  sizeItemContent: function (tag = "article") {
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
  // Transform text of item function (italics, bold, etc.)
  transformText: function (text) {
    let index,
      transformedText = text;
    // Search for indices of key strings
    while ((index = transformedText.search(/(?<!\<)\/i|\/b/i)) > -1) {
      let tagType = transformedText[index + 1] == "i" ? "i" : "strong";
      // Replace open string with open tag
      transformedText =
        transformedText.substring(0, index) +
        "<" +
        tagType +
        ">" +
        transformedText.substring(index + 3);
      // Replace close key string with close tag
      let i = index + 2;
      while (i < transformedText.length) {
        if (transformedText.charAt(i) == "/") {
          transformedText =
            transformedText.substring(0, i) +
            "</" +
            tagType +
            ">" +
            transformedText.substring(i + 1);
          break;
        }
        i++;
      }
    }

    return transformedText;
  },
  // Get audio for episode function
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
  // Function to Display Article or Episode
  item: function (id, type, preview = false) {
    // type = "article" or "episode"
    api.database = firebase.database();
    let published = api.params.get("published");
    // Set variables for database paths
    let items, itemContent;
    if (published === "false" && auth.editorStatus) {
      items = "/unpublished/" + type + "s/" + id;
      itemContent = "/unpublished/" + type + "Contents/" + id;
    } else if (published === "false" && !auth.editorStatus) {
      window.location.href = "/content.html";
    } else {
      items = "/" + type + "s/" + id;
      itemContent = "/" + type + "Contents/" + id;
    }
    // Set clickhandlers for Item Accessbility Features
    $("#accessibility-color")
      .off()
      .click(function () {
        $("body").toggleClass("dark");
        $(".item-date, .item-description, .back-to-resources")
          .toggleClass("text-muted")
          .toggleClass("color-light");
        $(
          ".item-topic, .accessibility-color, .accessibility-size, .dropdown-menu, .accessibility-preview"
        ).toggleClass("dark");
        $(".accessibility-color img").toggleClass("d-none");
        $(".header-small").toggleClass("bg-transparent");
        $(".header .bottom-curve").toggle();
      });
    var sizeMenu = false;
    $("#accessibility-size")
      .off()
      .click(function () {
        if (!sizeMenu) {
          $(this).next().fadeIn(100);
          sizeMenu = !sizeMenu;
        } else {
          $(this).next().fadeOut(100);
          sizeMenu = !sizeMenu;
        }
      });
    $(".item-accessibility-menu .dropdown-item")
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
    // Display item
    if (id !== "new") {
      // if item exists already...
      // Get item header data
      api.database.ref(items).on("value", (snapshot) => {
        api.data = snapshot.val() || null;
        document.title = api.data.title;
        if (!auth.editorStatus) {
          api.analytics.logEvent("select_item", {
            item_id: api.data.id,
            item_name: api.data.title,
            item_list_name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
          });
        }
        if (!auth.editorStatus || preview) {
          // Fill and display header for existing item
          $(".user").show();
          $(".editor-only").hide();
          api.itemID = id;
          $(".item-title").text(api.data.title);
          $(".item-description").text(api.data.description);
          $(".item-topic")
            .text(
              api.data.topic.charAt(0).toUpperCase() + api.data.topic.slice(1)
            )
            .attr("value", api.data.topic)
            .show();
          $(".item-date").text(
            new Date(api.data.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
          api.cardClickhandlers(false);
          $(".item-header").css("opacity", "1");
        } else {
          // Edit existing item (for editors)
          $(".user").hide();
          $(".editor-only").show();
          $("#item-title").html(api.data.title);
          $("#item-topic").val(api.data.topic).show();
          $("#item-description").html(api.data.description);
          $("#item-date").val(api.data.date);
          if (published === "false") {
            $("#editor-item-publish").show();
            $("#editor-item-published").hide();
            $("#editor-item-unpublish").hide();
          }
          if ((type = "episode")) {
            $("#item-go")
              .off()
              .click(() => {
                let newPid = $(".item-pid").val();
                api.getAudio(newPid);
              });
          }
          $(".item-header").css("opacity", "1");
        }
        api.sizeItemContent(type);
        $(window).resize(function () {
          api.sizeItemContent(type);
        });
        $("#item-loading").hide();
        $(".main").fadeIn();
        if (type == "episode") {
          api.getAudio(api.data.pid);
        }
      });
      // Get item content data
      api.database.ref(itemContent).on("value", (snapshot) => {
        // Process and display content
        api.dataContent = snapshot.val() || null;
        var contentColumn = $(".item-content-column");
        var key;
        contentColumn.empty();
        // Add top button to add items for editors
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
              object = api.transformText(api.dataContent[i][key]);
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
        $(".item-content").css("opacity", "1");
        if (auth.editorStatus && !preview) {
          editor.init();
        }
      });
    } else if (id == "new") {
      // if item is new...
      if (auth.editorStatus) {
        // for editors...
        // Create New Article Template
        $(".user").hide();
        $(".editor-only").show();
        $("#item-title").html("Title");
        $("#item-topic").show();
        $("#item-description").html("Description");
        $("#item-date").val(
          new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, -1)
        );
        $(".item-header").css("opacity", "1");
        $("#editor-item-delete").hide();
        $("#editor-item-published").hide();
        $("#editor-item-unpublish").hide();
        if (type == "episode") {
          $("#episode-go")
            .off()
            .click(() => {
              let newPid = $(".episode-pid").val();
              api.getAudio(newPid);
            });
        }
        var contentColumn = $(".item-content-column");
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
        $(".item-content").css("opacity", "1");
        editor.init();
        $("#item-loading").hide();
        api.sizeItemContent(type);
        $(window).resize(function () {
          api.sizeItemContent(type);
        });
      } else {
        window.location.href = "/content.html";
      }
    }
  },
};
