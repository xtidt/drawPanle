fis.match('**.scss', {
    rExt: '.css',
    parser: fis.plugin('node-sass'),
    optimizer: fis.plugin('clean-css'),
    useSprite: true
});

// 采用less
fis.match('**.less', {
    rExt: '.css', // from .less to .css
    parser: fis.plugin('less-2.x'), // less路径均用绝对路径
    useSprite: true
});

// 启用 fis-spriter-csssprites 插件
fis.match('::package', {
    spriter: fis.plugin('csssprites', {
        scale: 0.5
    })
});

//启用插件
fis.hook('relative');
//让所有文件，都使用相对路径。
fis.match('**', { relative: true });

// fis要求要么不设置deploy，要么所有文件都设置deploy
// fis.match('**', {
//     release: 'mall/$0'
// });


fis.match('**/_*.scss', {
    release: false
});

// mock数据需要在根路径下
// mock proxy注意不要匹配query，因为fis3-server-node会默认添加query
fis.match('mock/**', {
    release: '$0'
});

// 增加发布时间
fis.set('new date', Date());
var addPublishMeta = fis.plugin('replace', {
    from: "<head>",
    to: "<head><meta name='verson' content='" + fis.get('new date') + "'>"
});


// 多套环境配置
var envs = ['test', 'prod'];
envs.map(function(env) {
    fis.media(env).match('**.js', {
        optimizer: fis.plugin('uglify-js')
    });

    fis.media(env).match('*.css', {
        optimizer: fis.plugin('clean-css')
    });

    fis.media(env).match('mock/**', {
        release: false
    });
});