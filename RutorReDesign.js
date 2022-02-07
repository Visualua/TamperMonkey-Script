// ==UserScript==
// @name         Rutor ReDesign
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Скрывает ненужные пункты меню, подсветка годов (текущий/предыдущий), убраны всякие мелочи
// @author       
// @icon         https://www.google.com/s2/favicons?domain=rutor.is
// @match        http://rutor.is/new
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        none
// ==/UserScript==


(function() {
   'use strict';

   var $=window.jQuery;

// Поиск
$('.sideblock')[0].remove();
$('.sideblock').addClass('SearchChange');
$('.sideblock2').remove();
$(".SearchChange").css("position", "absolute").css("left", "0%").css("margin-top", "0%");

// Растягиваем сайт
var ContentFull = document.querySelector('#content');
ContentFull.classList.add('ContentChange');
$(".ContentChange").css("right", "0");

// Скрыть верхнее меню
$('.menu_b').remove();

// Вход
$('.logout').remove();

//Подсветка годов
    var Year = new Date().getFullYear();
    var Highlight = [
        Year, Year-1,
];
    for (var k in Highlight) {
       if (Highlight[k] == Year) {
$('tr:has(a:contains('+Highlight[k]+'))').addClass('HighlightText');
$(".HighlightText").css("background-color", "rgba(0, 194, 0, 0.20)");
        }
      if (Highlight[k] == Year-1) {
$('tr:has(a:contains('+Highlight[k]+'))').addClass('HighlightTextOld');
$(".HighlightTextOld").css("background-color", "rgba(230, 245, 39, 0.20)");
       }
}



// Название Категорий
var Tags = [
        "Показать новые раздачи вперемешку!", "Наши фильмы", "Научно-популярные фильмы", "Наши сериалы",
        "Телевизор", "Мультипликация", "Аниме", "Иностранные релизы", "Музыка", "Софт", "Спорт и Здоровье", "Юмор", "Хозяйство и Быт",
        "Книги", "Другое",
];

    for (var i in Tags) {
$('h2:has(a:contains('+Tags[i]+'))').addClass('blocked');
}

$(".blocked").css("display", "none");


// Таблицы Категорий
    var Category = [
        "1","3", "4", "6", "7", "8", "9", "10", "11",
        "13", "14", "15", "16", "17", "18"
];

for (var j in Category) {
var xpathResult = document.evaluate('(//table)['+Category[j]+']', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
var node=xpathResult.singleNodeValue;
    node.style.display='none';
}

})();
