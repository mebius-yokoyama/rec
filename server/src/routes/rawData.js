var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');
var fs = require('fs');

// rawデータリスト表示
exports.list = function (req, res) {
    try {
        console.log("load getRawDataList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // rawデータリスト取得API
        var key = null;
        var queryStr = "";
        var selWatchID = url.parse(req.url, true).query.watchID;
        if (selWatchID != undefined) {
            key = { watchID: selWatchID };
            queryStr = 'watchID=' + selWatchID;
        }

        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                if (nowPage * pageLimit > totalList) nowPage = parseInt(totalList / pageLimit);
                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        //console.log(JSON.stringify(item_list));
                        var count = item_list.length;
                        res.render('rawDataList', {
                            title: 'rawデータ一覧',
                            site: Const.SITE,
                            url: 'rawDataList',
                            totalList: totalList,
                            page: nowPage,
                            limit: pageLimit,
                            item_list: item_list,
                            queryStr: queryStr
                        });
                    }
                });
            });
        });
    } catch (e) {
        res.render('rawDataList', { title: 'error' });
        console.log("失敗：" + e);
    }
};

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download RawData ----");

        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            collection.find(null, { _id: 0, entrytime: 0 }).sort(order).toArray(function (err, item_list) {
                if (err) {
                    console.log('error: An error has occurred');
                    throw err;
                } else {
                    // データダウンロード
                    res.statusCode = 200;
                    var filename = Const.DB_TABLE_RAWDATA + '_' + Const.getDateString() +'.json';
                    res.set('Content-Disposition','attachment; filename="' + filename + '"');
                    res.setHeader('Content-Type', 'text/json; charset=utf8');
                            
                    res.write( JSON.stringify(item_list) );
                    //item_list.forEach(function(item) {
                    //    res.write( JSON.stringify(item) + '\n' );
                    //});
                    res.end();
                }
            });
        });
    } catch (e) {
        console.log("download error：" + e);
    }
}

