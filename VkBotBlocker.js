// ==UserScript==
// @name         VK bot block comments
// @namespace    http://tampermonkey.net/
// @version      1.0a
// @description  Скрывает комментарии от 15ти рублевых
// @match        https://vk.com/*
// @icon         https://www.google.com/s2/favicons?domain=vk.com
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';



    const classUfo = 'vkcbl-ufo';
    const classHidden = 'vkcbl-hidden';
    const classHasButton = 'vkcbl-has-button';
    const classButton = 'vkcbl-btn';

    var $ = $ || jQuery;
    var blacklist = window.localStorage.getItem('vkBlacklistIds') || '';

    blacklist = blacklist ? blacklist.split(';') : [];

    const button = '<div class="reply_action fl_r '+classButton+'" role="button" onmouseover="showTitle(this);" style="background:none"></div>';
    const informer = '<div class="fl_r"></div>';
    const buttonShowComment = '<div style="color:#aaa; margin: 7px 0 7px 44px" '+classButton+'" role="button" onmouseover="showTitle(this);" style="background:none"> </div>';
    const comment = '<div class = "reply reply_dived clear reply_replieable _post '+classUfo+'"></div>';
    const ufo = '<div style="color:#aaa; margin: 7px 0 7px 0px"> </div>';


    var buttonToBL = $(button)
    .html('💩')
    .attr("data-title","Отправить бота в ЧС")
    .on("click",function(e){
        let parent = $(e.target).parents('div[id^="post-"]').first();
        let userid = parent.data('answeringId');
        addToBlacklist(userid);
        e.stopPropagation();
    });

    var buttonFromBL = $(button)
    .html('💬')
    .attr("data-title","Убрать из ЧС")
    .on("click", function(e){
        let userid = $(e.target).data('userid');
        removeFromBlacklist(userid);
        e.stopPropagation();
    });

    var Informertooltip = $(informer)
    .html('[Коммент от бота]').css("color", "#ff0000a6");
    

 $(".Tooltip").css("background-color", "red");

    var buttonShow = $(buttonShowComment)
    .html('<div style="color:#aaa; margin: 7px 0 7px 5px">📌 [ Комментарий от бота скрыт ]</div>')
    .attr("data-title",'👀 Нажмите, чтобы посмотреть сообщение')
    .on("click", function(e){
        let userId = $(e.target).attr('data-userid');
        let ufo = $(e.target).parents('div.'+classUfo).first()
        let comment = ufo.prev().css("background-color", "#fff3f3").css("border", "dotted").css("border-color", "#ff000042").css("border-width", "2px");
        let actions = comment.find('div.post_actions');
        ufo.hide();
        comment.show();
        actions.find('div.'+classButton).remove();
        actions.append(buttonFromBL.clone(true).attr('data-userid',userId));
        actions.append(Informertooltip.clone(true));
        e.stopPropagation();
    });

   
    function addToBlacklist(userid)
    {
        blacklist.push(userid);
        window.localStorage.setItem('vkBlacklistIds', blacklist.join(';'));
        hideBlacklisted();
    }


    function removeFromBlacklist(userid)
    {
        blacklist.splice(blacklist.indexOf(userid), 1);
        window.localStorage.setItem('vkBlacklistIds', blacklist.join(';'));
        let comment = $("div[data-answering-id='"+userid+"']");
        comment.removeClass(classHidden);
        comment.parent().find("div."+classUfo).remove();
        let actions = comment.find('div.post_actions');
        actions.removeClass(classHasButton);
        actions.find('div.'+classButton).remove();
        addButtons();
    }


    function hideBlacklisted()
    {
        for (let i in blacklist){
            let userId = blacklist[i];
            $("div[data-answering-id='"+userId+"']:not(."+classHidden+")")
                .addClass(classHidden)
                .hide()
                .after(
                $(comment).append(
                    $(ufo)
                    .append(buttonShow.clone(true).attr('data-userid',userId))
                )
            );
        }
    }


    function hideNotifications()
    {
        for (let i in blacklist){
            let userId = blacklist[i];
            $('div.feedback_row_wrap:has(a[mention_id="id'+userId+'"])').hide();
        }
    }


    function BotList()
    {
        var count = 1;
        var username;
         for (let i in blacklist){
            username += count++ + ". " + blacklist[i] + "\r\n";
        }
        alert("Список ботов:\r\n" + username.replace("undefined", ""));
    }

    function addButtons()
    {
        let posts = $("div.post_actions:not(."+classHasButton+")");
        posts.append(buttonToBL.clone(true)).addClass(classHasButton);
    }


    hideBlacklisted();
    addButtons();

    var obsIds = ["page_body", "wrap3", "page_add_media", "wk_layer", "feed_rows", "page_wall_posts"];
    var observer = new MutationObserver(function(mrs){
        let newReplies = false;
        for (let mr=0; mr<mrs.length; mr++){
            let tid = mrs[mr].target.id
            if (obsIds.indexOf(tid) >=0 || tid.startsWith('replies')){
                hideBlacklisted();
                addButtons();
                break;
            }
        }
    });
    observer.observe(document.querySelector('body'), {childList: true, subtree: true});


    $('body').on('DOMNodeInserted', '#top_notify_wrap', function(e){
        hideNotifications();
    });
window.BotList2 = BotList;
$('li#l_mk').html('<div style="margin: 7px 0 9px 9px"><img src="https://icons.iconarchive.com/icons/yusuke-kamiyamane/fugue/16/blue-document-minus-icon-icon.png"></div><div style="margin: -27px 0 2px 36px"; onclick="window.BotList2()"><a href="#">Список ботов</a></div>');
})();
