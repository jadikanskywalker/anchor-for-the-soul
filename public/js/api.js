var api = {
    blogID: null,
    cardHTML: '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card bg-light"> <div class="card-body"> <div class="card-words pb-2 mb-1"> <div class="d-flex justify-content-between align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title"></h5> <p class="card-text"></p> </div> <div class="mt-1 d-flex justify-content-between align-items-end"> <div>  <p class="card-date text-muted mb-0"></p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div>',
    exploreHTML: '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card text-white card-explore"> <a href="blog.html"> <div class="card-bg-img"></div> <div class="layer" > </div> <div class="card-body"> <button class="btn btn-outline-light">Explore Blog ></button> </div> </a> </div> </div>',
    cardLeadHTML: '<div class="col-12 col-md-12 offset-md-0 mt-1 mt-md-3 mb-4 px-0 px-md-2"><div class="card card-lead"> <div class="row no-gutters"> <div class="col-md-5"> <div class="card-bg-img"></div> <div class="layer"></div> </div> <div class="col-md-7"> <div class="card-body"> <div class="card-words pb-5 mb-2"> <div class="card-words pb-1"> <div class="d-flex align-items-start"> <p class="card-type d-flex align-items-center"></p> <p class="card-topic text-muted" value=""></p> </div> <h5 class="card-title display-4 mb-4 pb-3"></h5> <p class="card-text ml-2"></p> </div> </div> <div class="card-details"> <div>  <p class="card-date text-muted mt-1 mb-0">August 31, 2020</p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div> </div> </div>',
    data: [],
    dataFlat: [],
    dataUnpublished: [],
    dataFlatUnpublished: [],
    dataFlatBoth: [],
    params: new URLSearchParams(window.location.search),
    filters: {
        topic: 'none',
        type: 'none'
    },
    filterMenu: false,
    highestID: null,
    sizeCards: function(set) {
        let cards = $(set + ' .card');
        let cardWords = $(set + ' .card-words');
        let maxHeight = -1;
        cardWords.each(function() {
            if ($(this).height('auto').height() > maxHeight) {
                maxHeight = $(this).height();
            }
        });
        $(set + ' .card-words').height(maxHeight);
        $(set + ' .card-explore').height($(set + ' .card:first-of-type').height());
        let card = 0;
        var showBlogs = setInterval(function() {
            if (card < cards.length) {
                cards.eq(card).css('opacity', '1');
                card++;
            } else {
                clearInterval(showBlogs);
            }
        }, 50);
    },
    sortByDate: function(data, type) {
        if (Array.isArray(data) && Array.isArray(type) && data.length == type.length) {
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
            return flatData.sort((a,b) => new Date(b.date) - new Date(a.date)).reverse();
        }
        return;
    },
    filter: function(data, leadCard = true, limit = null) {
        let filters = api.filters;
        if (data) {
            let topic = filters.topic && filters.topic != 'none' ? true : false;
            let type = filters.type && filters.type != 'none' ? true : false;
            if (!topic && !type) {
                api.populate(data, leadCard, limit);
                return;
            }
            let filteredData = [];
            for (var i = 0; i <= data.length - 1; i++) {
                if (((topic && data[i].topic == filters.topic) || !topic) && ((type && data[i].type == filters.type) || !type)) {
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
    populate: function(data, leadCard = true, limit = null, filter = true) {
        let cardLeadHTML = api.cardLeadHTML;
        let cardHTML = api.cardHTML;
        $('#content').empty();
        $('#content-lead').empty();
        let num = leadCard ? 2 : 1;
        let end = limit && data.length > limit ? data.length - limit : 0;
        for (var i = data.length - 1; i >= end; i--) {
            var blog = data[i];
            if (i != data.length - 1 || !leadCard) {
                $('#content').append(cardHTML);
                var card = $('#content .card').eq(data.length - num - i);
                var dateTag = '';
            } else {
                $('#content-lead').append(cardLeadHTML);
                var card = $('#content-lead .card-lead');
                var dateTag = '<b>Newest</b> &bull; ';
            }
            card.find('.card-type').html('<img class="card-type-img" src="images/' + blog.type + '.svg" height="15px" width="15px">' + blog.type.charAt(0).toUpperCase() + blog.type.slice(1)).attr('value', blog.type);
            card.find('.card-title').text(blog.title);
            card.find('.card-text').text(blog.description);
            card.find($('.card-topic')).text(blog.topic.charAt(0).toUpperCase() + blog.topic.slice(1)).attr('value', blog.topic);
            card.find('.card-date').html(dateTag + new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
            let btn = card.find('.btn');
            if (auth.editorStatus) {
                btn.text('Edit >');
                if (blog.published === 'false') {
                    card.find('.card-date').before('<p class="text-info mb-0">&#10007; Unpublished</p>');
                    btn.attr('href', blog.type + '.html?id=' + blog.id + '&published=false');
                } else {
                    card.find('.card-date').css('margin-bottom', '0.5rem').before('<p class="text-success mb-0">&#10003; Published</p>');
                    btn.attr('href', blog.type + '.html?id=' + blog.id);
                }
            } else if (blog.type == 'episode') {
                btn.text('Listen >');
                btn.attr('href', blog.type + '.html?id=' + blog.id);
            }
        }
        if (leadCard) {
            $('.card-lead').show().css('opacity', 1);
        } else {
            $('.card-lead').hide();
        }
        api.cardClickhandlers(filter);
        $('#content-loading').hide();
        $('.main').show();
        api.sizeCards('#content');
    },
    contentInit: function(filter = true) {
        $.when(
            // Get Articles
            $.ajax({
                url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
                data: {
                    orderBy: '"$key"',
                    limitToLast: 20
                },
                success: function(content, status, jqXHR) {
                    api.data[0] = content;
                }
            }),
            // Get Episodes
            $.ajax({
                url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
                data: {
                    orderBy: '"$key"',
                    limitToLast: 10
                },
                success: function(content, status, jqXHR) {
                    api.data[1] = content;
                }
            })
        ).then(function() {
            if (auth.editorStatus) {
                $('#clear-filters').after('<select class="custom-select mx-2 mt-2" id="filter-published-select" style="width:140px""><option selected value="both">All Articles</option><option value="true">Published</option><option value="false">Unpublished</option></select><a class="btn btn-info mx-2" id="new-article" href="/article.html?id=new">+ New Article</a><a class="btn btn-info mx-2" id="new-episode" href="/episode.html?id=new">+ New Episode</a>');
            } else {
                $('#new-article, #new-episode, #filter-published-select').remove();
            }
            api.dataFlat = api.sortByDate(api.data, ['article', 'episode']);
            if (filter) {
                let params = api.params;
                if (params.has('topic')) {
                    api.filters.topic = params.get('topic');
                    $("#filter-topic-select").val(params.get('topic'));
                    $('#filters').show().css('opacity', 1);
                    $('.filter-menu p').css('max-width', '7rem');
                    api.filterMenu = true;
                }
                if (params.has('type')) {
                    api.filters.type = params.get('type');
                    $("#filter-type-select").val(params.get('type'));
                }
                if (auth.editorStatus) {
                    if (params.has('published')) {
                        api.filters.published = params.get('published');
                        $('#filter-published-select').val(params.get('published'));
                        if (api.filters.published === 'false') {
                            api.unpublishedContentInit('false');
                        } else if (api.filters.published === 'true') {
                            api.unpublishedContentInit('true');
                        } else {
                            api.unpublishedContentInit('both');
                        }
                    } else {
                        api.unpublishedContentInit('both');
                    }
                } else {
                    api.filter(api.dataFlat);
                }
                $(document).on('change','#filter-topic-select, #filter-type-select, #filter-published-select',function() {
                    api.filters.topic = $('#filter-topic-select').val(),
                    api.filters.type = $('#filter-type-select').val();
                    if (auth.editorStatus) {
                        api.filters.published = $('#filter-published-select').val();
                        if (api.filters.published === 'false') {
                            api.filter(api.dataFlatUnpublished, false);
                        } else if (api.filters.published === 'true') {
                            api.filter(api.dataFlat);
                        } else {
                            api.filter(api.dataFlatBoth);
                        }
                    } else {
                        api.filter(api.dataFlat);
                    }
                });
                $('#clear-filters').click(function() {
                    api.filters = {
                        topic: 'none',
                        type: 'none',
                        published: 'both'
                    }
                    $('#filter-topic-select').val("none"),
                    $('#filter-type-select').val("none");
                    $('#filter-published-select').val("both");
                    $('#filters').animate({ opacity: 0, right: '1.1rem' }, 300, 'swing', function() {
                        $('#filters').hide();
                    });
                    $('.filter-menu p').css('max-width', '')
                    if (auth.editorStatus) {
                        api.populate(api.dataFlatBoth);
                    } else {
                        api.populate(api.dataFlat);
                    }
                });
                $('.filter-menu').click(function() {
                    if (api.filterMenu) {
                        $('#filters').animate({ opacity: 0, right: '1.1rem' }, 300, 'swing', function() {
                            $('#filters').hide();
                        });
                        $('.filter-menu p').css('max-width', '');
                    } else {
                        $('#filters').css('right', '1rem').show().animate({ opacity: 1, right: '1.3rem' }, 200);
                        $('.filter-menu p').css('max-width', '7rem');
                    }
                    api.filterMenu = !api.filterMenu;
                });
                $('.filter-close').click(function() {
                    $('#filters').animate({ opacity: 0, right: '1.1rem' }, 300, 'swing', function() {
                        $('#filters').hide();
                    });
                    $('.filter-menu p').css('max-width', '');
                    api.filterMenu = false;
                })
            } else {
                api.populate(api.dataFlat, true, null, false);
            }
        });
    },
    unpublishedContentInit: function(published = true) {
        $.when(
            // Get Articles
            $.ajax({
                url: 'https://anchor-for-the-soul.firebaseio.com/unpublished/blogs.json',
                data: {
                    orderBy: '"$key"',
                    limitToLast: 100
                },
                success: function(content, status, jqXHR) {
                    api.dataUnpublished[0] = content;
                }
            })
        ).then(function() {
            api.dataFlatUnpublished = api.sortByDate(api.dataUnpublished, ['article']);
            for (article in api.dataFlatUnpublished) {
                api.dataFlatUnpublished[article].published = 'false';
            }
            api.dataFlatBoth = api.sortByDate([api.dataUnpublished[0], api.data[0], api.data[1]], ['article', 'article', 'episode']);
            if (published === 'true') {
                api.filter(api.dataFlat, true);
            } else if (published === 'false') {
                api.filter(api.dataFlatUnpublished, false);
            } else {
                api.filter(api.dataFlatBoth);
            }
        });
    },
    cardClickhandlers: function(content = true) {
        if (content) { 
            $('.card-topic').click(function() {
                let value = $(this).attr('value');
                if (value) {
                    api.filters.topic = value;
                    $('#filter-topic-select').val(value);
                    api.filter(api.dataFlat);
                    if (!api.filterMenu) {
                        $('#filters').css('right', '1rem').show().animate({ opacity: 1, right: '1.3rem' }, 200);
                        $('.filter-menu p').css('max-width', '7rem')
                        api.filterMenu = true;
                    }
                }
            });
            $('.card-type').click(function() {
                let value = $(this).attr('value');
                if (value) {
                    api.filters.type= value;
                    $('#filter-type-select').val(value);
                    api.filter(api.dataFlat);
                    if (!api.filterMenu) {
                        $('#filters').css('right', '1rem').show().animate({ opacity: 1, right: '1.3rem' }, 200);
                        $('.filter-menu p').css('max-width', '7rem')
                        api.filterMenu = true;
                    }
                }
            });
        } else {
            $('.card-topic, .article-topic, .podcast-topic').click(function() { window.location.href = "./content.html?topic=" + $(this).attr('value'); });
            $('.card-type').click(function() { window.location.href = "./content.html?type=" + $(this).attr('value'); });
        }
    },
    latestArticles: function(id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                limitToLast: 5
            },
            success: function(content, status, jqXHR) {
                var data = content;
                // console.log(data);
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
                data = api.sortByDate([data], ['article']);
                api.populate(data, false, 4, false);
            }
        });
    },
    latestEpisodes: function(explore, id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                limitToLast: 5
            },
            success: function(content, status, jqXHR) {
                var data = content;
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
                data = api.sortByDate([data], ['episode']);
                api.populate(data, false, 4, false);
            }
        });
    },
    sizeArticleContent: function() {
        var height = {
            window: $(window).height(),
            navbar: $('.header').outerHeight(),
            articleHeader: $('.article-header').outerHeight(),
            latestBlogs: $('#latestArticles').outerHeight(),
            footer: $('.footer').outerHeight()
        }
        $('.article-content').css('min-height', height.window - height.navbar - height.articleHeader);
    },
    article: function(id) {
        let published = api.params.get('published');
        let urlHeader, urlContent;
        if (published === 'false' && auth.editorStatus) {
            urlHeader = 'https://anchor-for-the-soul.firebaseio.com/unpublished/blogs.json';
            urlContent = 'https://anchor-for-the-soul.firebaseio.com/unpublished/blogContent.json';
        } else if (published === 'false' && !auth.editorStatus) {
            window.location.href = '/content.html';
        } else {
            urlHeader = 'https://anchor-for-the-soul.firebaseio.com/blogs.json';
            urlContent = 'https://anchor-for-the-soul.firebaseio.com/blogContent.json';
        }
        if (id !== 'new') {
        $.ajax({
            url: urlHeader,
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                api.data = data[id];
                document.title = data[id].title  + ' – Resources';
                if (!auth.editorStatus) {
                    // Display existing article
                    $('.user').show();
                    $('.editor-only').hide();
                    api.blogID = id;
                    $('.article-title').text(data[id].title);
                    $('.article-topic').text(data[id].topic.charAt(0).toUpperCase() + data[id].topic.slice(1)).attr('value', data[id].topic).show();
                    api.cardClickhandlers(false);
                    $('.article-description').text(data[id].description);
                    $('.article-date').text(new Date(data[id].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    $('.article-header').css('opacity', '1');
                } else {
                    // Edit existing article
                    $('.user').hide();
                    $('.editor-only').show();
                    $('#article-title').html(data[id].title);
                    $('#article-topic').val(data[id].topic).show();
                    $('#article-description').html(data[id].description);
                    $('#article-date').val(data[id].date);
                    if (published === 'false') {
                        $('#editor-article-publish').show();
                        $('#editor-article-published').hide();
                        $('#editor-article-unpublish').hide();
                    }
                    $('.article-header').css('opacity', '1');
                }
                api.sizeArticleContent();
                $(window).resize(function() { api.sizeArticleContent(); });
                $('#article-loading').hide();
                $('.main').fadeIn();
            }
        });
        $.ajax({
            url: urlContent,
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                var contentColumn = $('.article-content-column');
                var key;
                api.highestID = data[id].length - 1;
                contentColumn.empty();
                for (var i = 0; i < data[id].length; i++) {
                    key = Object.keys(data[id][i])[0];
                    if (!auth.editorStatus) {
                        contentColumn.append("<" + key + ">" + data[id][i][key] + "</" + key + ">");
                    } else {
                        if (key == 'p') {
                            contentColumn.append("<div class='editor-editable'><div contenteditable id='" + i + "'  type='" + key + "' class='bg-light content-editable' style='width:100%;'>" + data[id][i][key] + "</div><button class='editor-delete text-muted' placeid='" + i + "'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' + i + '">+</button> </div>' + "</div>");
                        } else {
                            contentColumn.append("<div class='editor-input'><input id='" + i + "' type='" + key + "' value='" + data[id][i][key] + "' class='bg-light " + key + "' style='width:100%;'> <button class='editor-delete text-muted' placeid='" + i + "'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="' + i + '">+</button> </div>' + "<div>");
                        }
                        contentColumn.append();
                    }
                }
                $('.article-content').css('opacity', '1');
                if (auth.editorStatus) {
                    editor.init();
                }
            }
        });
        } else if (id == 'new') {
            if (auth.editorStatus) {
                // Create New Article Template
                $('.user').hide();
                $('.editor-only').show();
                $('#article-title').html("Title");
                $('#article-topic').show();
                $('#article-description').html("Description");
                $('#article-date').val(new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString());
                $('.article-header').css('opacity', '1');
                $('#editor-article-delete').hide();
                $('#editor-article-published').hide();
                $('#editor-article-unpublish').hide();
                var contentColumn = $('.article-content-column');
                api.highestID = 1;
                contentColumn.empty();
                contentColumn.append("<div class='editor-input'><input id='0' type='h3' value='Header' class='bg-light h3' style='width:100%;'> <button class='editor-delete text-muted' placeid='0'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="0">+</button> </div>' + "<div>");
                contentColumn.append("<div class='editor-editable'><div contenteditable id='1'  type='p' class='bg-light content-editable' style='width:100%;'>Paragraph</div><button class='editor-delete text-muted' placeid='1'>x</button>" + '<div class="editor-buttons"> <button class="btn btn-info editor-add" placeid="1">+</button> </div>' + "</div>");
                $('.article-content').css('opacity', '1');
                editor.init();
                api.sizeArticleContent();
                $(window).resize(function() { api.sizeArticleContent(); });
            } else {
                window.location.href = '/content.html';
            }
        }
    },
    episode: function(iframe, id) {
        if (id != 'new') {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                document.title = data[id].title  + ' – Resources';
                if (!auth.editorStatus) {
                    $('.user').show();
                    $('.editor-only').hide();
                    $('.podcast-date').text(new Date(data[id].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    $('.podcast-topic').text(data[id].topic.charAt(0).toUpperCase() + data[id].topic.slice(1)).attr('value', data[id].topic).addClass(['bg-dark', 'text-white']).show();
                    api.cardClickhandlers(false);
                    $('.podcast-title').text(data[id].title);
                    $('.podcast-description').text(data[id].description);
                } else {
                    $('.editor-only').show();
                    $('.user').hide();
                    $('#podcast-date').val(data[id].date);
                    $('#podcast-topic').val(data[id].topic).show();
                    $('#podcast-title').text(data[id].title);
                    $('#podcast-description').text(data[id].description);
                    $('#podcast-url').val(data[id].url);
                    $('#url-go').click(function() {
                        $(iframe).attr('src', $('#podcast-url').val());
                    });
                }
                $('#podcast-loading').show();
                $('.podcast-details').css('opacity', 1);
                $(iframe).on('load', function() {
                    $('#podcast-loading').fadeOut(300);
                    $(this).css('opacity', 1);
                });
                $(iframe).attr('src', data[id].url);
                if (auth.editorStatus) {
                    editor.init();
                }
            }
        });
        } else {
            if (auth.editorStatus) {
                $('.editor-only').show();
                $('.user').hide();
                $('#podcast-date').val(new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString());
                $('#podcast-title').text('Title');
                $('#podcast-topic').show();
                $('#podcast-description').text('Description');
                $('#podcast-url').val('URL');
                $('#url-go').click(function() {
                    $(iframe).attr('src', $('#podcast-url').val());
                    $('#podcast-loading').show();
                    $(iframe).hide();
                });
                $('#podcast-loading').show();
                $('.podcast-details').css('opacity', 1);
                $(iframe).on('load', function() {
                    $('#podcast-loading').fadeOut(300);
                    $(this).css('opacity', 1);
                });
                if (auth.editorStatus) {
                    editor.init();
                }
            }
        }
    }
}
