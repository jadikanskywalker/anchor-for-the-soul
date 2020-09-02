var api = {
    blogID: null,
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
    latestBlogs: function(explore, id) {
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
                let cardHTML = '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card"> <div class="card-body"> <div class="card-words pb-1"> <h5 class="card-title"></h5> <p class="card-text"></p> </div> <p class="card-date text-muted mb-2"></p> <a href="" class="btn btn-info">Read ></a> </div> </div> </div>';
                let exploreHTML = explore ? '<div class="col-12 col-sm-6 col-lg-4 col-xl-3"> <div class="card text-white card-explore"> <a href="blog.html"> <div class="card-bg-img"></div> <div class="layer" > </div> <div class="card-body"> <button class="btn btn-outline-light">Explore Blog ></button> </div> </a> </div> </div>' : '';
                $('#loadingBlogs').hide();
                for (var i = data.length - 1; i > num; i--) {
                    $('#latestBlogs').append(cardHTML);
                    let blog = data[i];
                    let card = $('#latestBlogs .card').eq(data.length - 1 - i);
                    card.find('.card-title').text(blog.title);
                    card.find('.card-text').text(blog.description);
                    card.find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    card.find('.btn').attr('href', 'article.html?id=' + i);
                };
                $('#latestBlogs').append(exploreHTML);
                api.sizeCards('#latestBlogs');
            }
        });
    },
    latestPodcasts: function(explore, id) {
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
                $('#loadingPodcasts').hide();
                for (var i = data.length - 1; i > num; i--) {
                    $('#latestPodcasts').append(cardHTML);
                    let blog = data[i];
                    let card = $('#latestPodcasts .card').eq(data.length - 1 - i);
                    card.find('.card-title').text(blog.title);
                    card.find('.card-text').text(blog.description);
                    card.find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    card.find('.btn').attr('href', 'podcastEpisode.html?id=' + i);
                }
                $('#latestPodcasts').append(exploreHTML);
                api.sizeCards('#latestPodcasts');
            }
        });
    },
    sizeBlogContent: function() {
        var height = {
            window: $(window).height(),
            navbar: $('.navbar').outerHeight(),
            blogHeader: $('.blog-header').outerHeight(),
            latestBlogs: $('#latestBlogs').outerHeight(),
            footer: $('.footer').outerHeight()
        }
        $('.blog-content').css('min-height', height.window - height.navbar - height.blogHeader);
    },
    blogPost: function(id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                api.blogID = id;
                $('.blog-title').text(data[id].title);
                $('.blog-description').text(data[id].description);
                $('.blog-date').text(new Date(data[id].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                $('.blog-header').css('opacity', '1');
                api.sizeBlogContent();
                $(window).resize(function() { api.sizeBlogContent(); });
            }
        });
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogContent.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                var contentColumn = $('.blog-content-column');
                var key;
                for (var i = 0; i < data[id].length; i++) {
                    key = Object.keys(data[id][i])[0];
                    contentColumn.append("<" + key + ">" + data[id][i][key] + "</" + key + ">");
                }
                $('.blog-content').css('opacity', '1');
            }
        });
    },
    podcastEpisode: function(iframe, id) {
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

