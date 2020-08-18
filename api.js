var api = {
    sizeCards: function(set) {
        let cards = $(set + ' .card-words');
        let maxHeight = -1;
        cards.each(function() {
            if ($(this).height('auto').height() > maxHeight) {
                maxHeight = $(this).height();
            }
        });
        $(set + ' .card-words').height(maxHeight);
        $(set + ' .card-explore').css('opacity', '1').height($(set + ' .card:first-of-type').height());
    },
    latestBlogs: function(num) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                limitToLast: num
            },
            success: function(data, status, jqXHR) {
                console.log(data);
                let cards = $('#latestBlogs .card').slice(0, 3);
                let key = 3;
                $('#loadingBlogs').hide();
                cards.each(function() {
                    let blog = data[key];
                    $(this).find('.card-title').text(blog.title);
                    $(this).find('.card-text').text(blog.description);
                    $(this).find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    $(this).find('.btn').attr('href', './blog.html?id=' + 'key');
                    key--;
                    $(this).css('opacity', '1');
                });
                api.sizeCards('#latestBlogs');
            }
        });
    },
    latestPodcasts: function(num) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                limitToLast: num
            },
            success: function(data, status, jqXHR) {
                console.log(data);
                let cards = $('#latestPodcasts .card').slice(0, 3);
                let key = 3;
                $('#loadingPodcasts').hide();
                cards.each(function() {
                    let blog = data[key];
                    $(this).find('.card-title').text(blog.title);
                    $(this).find('.card-text').text(blog.description);
                    $(this).find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    key--;
                    $(this).css('opacity', '1');
                });
                api.sizeCards('#latestPodcasts');
            }
        });
    },
    embedPodcast: function(id, url) {
        $(id).on('load', function() {
            let contents = $(this).contents();
            contents.find('img').height(200).width('auto');
        });
        $(id).attr('src', url);
    }
}

