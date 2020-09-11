var api = {
    blogID: null,
    cardHTML: '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card"> <div class="card-body"> <div class="card-words pb-2 mb-1"> <h5 class="card-title"></h5> <p class="card-text mb-2 pb-1"></p> </div> <div class="mt-1 d-flex justify-content-between align-items-end"> <div> <p class="card-topic text-muted m-0" value=""></p> <p class="card-date text-muted mt-1 mb-0"></p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div>',
    exploreHTML: '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card text-white card-explore"> <a href="blog.html"> <div class="card-bg-img"></div> <div class="layer" > </div> <div class="card-body"> <button class="btn btn-outline-light">Explore Blog ></button> </div> </a> </div> </div>',
    cardLeadHTML: '<div class="col-12 col-md-12 offset-md-0 mb-2"><div class="card card-lead"> <div class="row no-gutters"> <div class="col-md-4"> <div class="card-bg-img"></div> <div class="layer"></div> </div> <div class="col-md-8"> <div class="card-body"> <div class="card-words pb-5 mb-4"> <h5 class="card-title display-4 mb-4 pb-3">The Self-Love Delusion</h5> <p class="card-text ml-2">The Bible is clear: we don\'t need bother loving ourselves. We must love Christ and others.</p> </div> <div class="card-details"> <div> <p class="card-topic text-muted m-0" value=""></p> <p class="card-date text-muted mt-1 mb-0">August 31, 2020</p> </div> <a href="" class="btn btn-info">Read ></a> </div> </div> </div> </div> </div> </div>',
    dataCache: null,
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
            if (card < 4) {
                cards.eq(card).css('opacity', '1');
                card++;
            } else {
                clearInterval(showBlogs);
            }
        }, 50);
    },
    blog: function() {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                limitToLast: 10
            },
            success: function(content, status, jqXHR) {
                var data = content;
                api.dataCache = content;
                api.populateBlog(data, true, function () {
                    var params = new URLSearchParams(window.location.search);
                    if (params.has('topic')) {
                        $("#filter-topic-select").val(params.get('topic'));
                        api.filterTopic($('#filter-topic-select'));
                    }
                });
            }
        });
    },
    populateBlog: function(data, leadCard = true, callback = null) {
        let cardLeadHTML = api.cardLeadHTML;
        let cardHTML = api.cardHTML;
        $('#blog').empty();
        $('#blog-lead').empty();
        let num = leadCard ? 2 : 1;
        for (var i = data.length - 1; i >= 0; i--) {
            var blog = data[i];
            console.log(blog);
            if (i != data.length - 1 || !leadCard) {
                $('#blog').append(cardHTML);
                var card = $('#blog .card').eq(data.length - num - i);
            } else {
                $('#blog-lead').append(cardLeadHTML);
                var card = $('#blog-lead .card-lead');
            }
            card.find('.card-title').text(blog.title);
            card.find('.card-text').text(blog.description);
            card.find($('.card-topic')).text(blog.topic.charAt(0).toUpperCase() + blog.topic.slice(1)).attr('value', blog.topic);
            card.find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
            card.find('.btn').attr('href', 'article.html?id=' + i);
        };
        if (leadCard) {
            $('.card-lead').show().css('opacity', 1);
        } else {
            $('.card-lead').hide();
        }
        api.topicClickhandler();
        $('#filters').css('opacity', 1);
        api.sizeCards('#blog');
        callback();
    },
    topicClickhandler: function(blog = true) {
        if (blog) { 
            $('.card-topic').click(function() {
            let value = $(this).attr('value');
            if (value) {
                $('#filter-topic-select').val(value);
                api.filterTopic($('#filter-topic-select'))
            }
        });
        } else {
            $('.card-topic').click(function() { window.location.href = "./blog.html?topic=" + $(this).attr('value'); });
        }
    },
    filterTopic: function(input) {
        let topic = input.val();
        let data = api.dataCache;
        if (topic == 'none') {
            if (data) {
                api.populateBlog(data);
            } else {
                api.blog();
            }
        } else {
            if (data) {
                let filteredData = [];
                for (var i = data.length - 1; i >= 0; i--) {
                    if (data[i].topic == topic) {
                        filteredData.push(data[i]);
                    }
                }
                api.populateBlog(filteredData, false);
                console.log(filteredData);
            }
        }
    },
    latestArticles: function(explore, id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                limitToLast: 5
            },
            success: function(content, status, jqXHR) {
                var data = content;
                console.log(data);
                if (id) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        if (id == data[i].id) {
                            data.splice(id, 1);
                            break;
                        }
                    }
                }
                let num = explore ? data.length - 4 : data.length - 5;
                
                console.log(data);
                let cardHTML = api.cardHTML;
                let exploreHTML = explore ? api.exploreHTML : '';
                $('#loadingLatestArticles').hide();
                for (var i = data.length - 1; i > num; i--) {
                    $('#latestArticles').append(cardHTML);
                    let blog = data[i];
                    let card = $('#latestArticles .card').eq(data.length - 1 - i);
                    card.find('.card-title').text(blog.title);
                    card.find('.card-text').text(blog.description);
                    card.find($('.card-topic')).text(blog.topic.charAt(0).toUpperCase() + blog.topic.slice(1)).attr('value', blog.topic);
                    card.find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    card.find('.btn').attr('href', 'article.html?id=' + i);
                };
                $('#latestArticles').append(exploreHTML);
                api.topicClickhandler(false);
                api.sizeCards('#latestArticles');
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
                console.log(data);
                if (id) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        if (id == data[i].id) {
                            data.splice(id, 1);
                            break;
                        }
                    }
                }
                let num = explore ? data.length - 4 : data.length - 5;
                let cardHTML = '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card "> <div class="card-body"> <div class="card-words pb-1"> <h5 class="card-title"></h5> <p class="card-text mb-2"></p> </div> <p class="card-date text-muted mb-2"></p> <a href="" class="btn btn-info">Listen ></a> </div> </div> </div>';
                let exploreHTML = explore ? '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card text-white card-explore wave"> <a href="podcast.html"> <div class="card-bg-img"></div> <div class="layer" > </div> <div class="card-body"> <button class="btn btn-outline-light">Explore Podcast ></button> </div> </a> </div> </div>' : '';
                $('#loadingLatestEpisodes').hide();
                for (var i = data.length - 1; i > num; i--) {
                    $('#latestEpisodes').append(cardHTML);
                    let blog = data[i];
                    let card = $('#latestEpisodes .card').eq(data.length - 1 - i);
                    card.find('.card-title').text(blog.title);
                    card.find('.card-text').text(blog.description);
                    card.find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    card.find('.btn').attr('href', 'episode.html?id=' + i);
                }
                $('#latestEpisodes').append(exploreHTML);
                api.sizeCards('#latestEpisodes');
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
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                api.blogID = id;
                $('.article-title').text(data[id].title);
                $('.article-description').text(data[id].description);
                $('.article-date').text(new Date(data[id].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                $('.article-header').css('opacity', '1');
                api.sizeArticleContent();
                $(window).resize(function() { api.sizeBlogContent(); });
            }
        });
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogContent.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                var contentColumn = $('.article-content-column');
                var key;
                for (var i = 0; i < data[id].length; i++) {
                    key = Object.keys(data[id][i])[0];
                    contentColumn.append("<" + key + ">" + data[id][i][key] + "</" + key + ">");
                }
                $('.article-content').css('opacity', '1');
            }
        });
    },
    episode: function(iframe, id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                console.log(data);
                $('.podcast-title').text(data[id].title);
                $('.podcast-description').text(data[id].description);
                $('.podcast-loading').show();
                $('.podcast-details').css('opacity', 1);
                $(iframe).on('load', function() {
                    $('.podcast-loading').fadeOut(300);
                    $(this).css('opacity', 1);
                });
                $(iframe).attr('src', data[id].url);
            }
        });
    }
}

