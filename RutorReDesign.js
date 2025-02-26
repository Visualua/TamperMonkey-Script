// ==UserScript==
// @name         Rutor Dark Theme Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Modern dark theme for rutor.info and rutor.is with settings and highlighting features
// @author       You
// @match        *://*.rutor.info/*
// @match        *://*.rutor.is/*
// @match        *://rutor.info/*
// @match        *://rutor.is/*
// @match        *://*.cdnbunny.org/*
// @match        *://alt.rutor.info/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Load jQuery if not already available
    if (typeof jQuery === 'undefined') {
        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.6.4.min.js';
        script.type = 'text/javascript';
        script.onload = function() {
            console.log('jQuery loaded');
            initializeScript(jQuery);
        };
        document.head.appendChild(script);
    } else {
        initializeScript(jQuery);
    }

    function initializeScript($) {
        // Main color scheme
        const colors = {
            background: '#121212',
            cardBackground: '#1e1e1e',
            primaryText: '#e0e0e0',
            secondaryText: '#b0b0b0',
            accent: '#2196F3',
            border: '#333333',
            tableOdd: '#1a1a1a',
            tableEven: '#252525',
            hoverColor: '#303030',
            green: '#4CAF50',
            yellow: '#FFC107',
            red: '#F44336',
            headerBackground: '#1a1a1a',
            modalBackground: '#252525',
            modalOverlay: 'rgba(0, 0, 0, 0.7)',
        };

        // Обновленные настройки по умолчанию
        const defaultSettings = {
            hiddenCategories: [], // Empty by default
            highlightCurrentYear: true,
            highlightPreviousYear: true,
            currentYearHighlightColor: 'rgba(76, 175, 80, 0.25)', // Зеленый
            previousYearHighlightColor: 'rgba(255, 193, 7, 0.25)', // Желтый
            currentYearHighlightHoverColor: 'rgba(76, 175, 80, 0.35)',
            previousYearHighlightHoverColor: 'rgba(255, 193, 7, 0.35)'
        };

        // Get or initialize settings
        let settings = GM_getValue('rutorSettings', defaultSettings);

        // Define categories by their header text
        const categories = [
            { id: 'all', name: 'Показать новые раздачи вперемешку', text: 'Показать новые раздачи вперемешку' },
            { id: 'foreign_movies', name: 'Зарубежные фильмы', text: 'Зарубежные фильмы' },
            { id: 'russian_movies', name: 'Наши фильмы', text: 'Наши фильмы' },
            { id: 'science_movies', name: 'Научно-популярные фильмы', text: 'Научно-популярные фильмы' },
            { id: 'foreign_series', name: 'Зарубежные сериалы', text: 'Зарубежные сериалы' },
            { id: 'russian_series', name: 'Наши сериалы', text: 'Наши сериалы' },
            { id: 'tv', name: 'Телевизор', text: 'Телевизор' },
            { id: 'cartoons', name: 'Мультипликация', text: 'Мультипликация' },
            { id: 'anime', name: 'Аниме', text: 'Аниме' },
            { id: 'foreign', name: 'Иностранные релизы', text: 'Иностранные релизы' },
            { id: 'music', name: 'Музыка', text: 'Музыка' },
            { id: 'soft', name: 'Софт', text: 'Софт' },
            { id: 'games', name: 'Игры', text: 'Игры' },
            { id: 'sport', name: 'Спорт и Здоровье', text: 'Спорт и Здоровье' },
            { id: 'humor', name: 'Юмор', text: 'Юмор' },
            { id: 'household', name: 'Хозяйство и Быт', text: 'Хозяйство и Быт' },
            { id: 'books', name: 'Книги', text: 'Книги' },
            { id: 'other', name: 'Другое', text: 'Другое' }
        ];

        // Helper functions for year
        const getCurrentYear = () => new Date().getFullYear();
        const getPreviousYear = () => getCurrentYear() - 1;

        // Add CSS styles
        GM_addStyle(`


        .search-container-right {
        position: fixed !important;
        top: 15px !important;
        right: 15px !important;
        width: 280px !important;
        background-color: ${colors.cardBackground} !important;
        padding: 15px !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
        z-index: 999 !important;
    }

    /* Стили для мобильных устройств */
    @media (max-width: 768px) {
        .search-container-right {
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            border-radius: 0 !important;
        }
    }


            /* Global styles */
            body, html, #all, #ws, #content {
                background-color: ${colors.background} !important;
                color: ${colors.primaryText} !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
            }

            /* Hide top header completely */
            #up {
                display: none !important;
            }

            /* Remove RUTOR text and use that space for search */
            body:before {
                content: none !important;
            }



            /* Hide all category icon images */
            img[src*="cdnbunny.org/i/ic"],
            img[src*="cdnbunny.org/t/top.gif"],
            img[src*="icseriali.gif"],
            img[src*="ickino.gif"],
            img[src*="/i/ic"] {
                display: none !important;
            }

            /* Hide RSS buttons */
            a[href*="rss"] {
                display: none !important;
            }

            img[src*="rss"] {
                display: none !important;
            }

            /* Make the search box sticky in top left corner instead of RUTOR text */
            .s_search {
                position: fixed !important;
                top: 15px !important;
                left: 15px !important;
                z-index: 1000 !important;
                background-color: ${colors.cardBackground} !important;
                padding: 10px !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
                max-width: 300px !important;
            }

            #search {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
            }

            /* Adding spacing at the top for fixed elements */
            #content {
                padding-top: 75px !important;
            }

            /* Menu */
            #menu {
                background-color: ${colors.headerBackground} !important;
                border-radius: 8px !important;
                display: flex !important;
                flex-wrap: wrap !important;
                padding: 0 !important;
                margin-bottom: 15px !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
                position: fixed !important;
                top: 15px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                z-index: 999 !important;
                width: auto !important;
            }

            .menu_b {
                color: ${colors.primaryText} !important;
                text-decoration: none !important;
                padding: 12px 20px !important;
                transition: background-color 0.2s ease !important;
                border-radius: 4px !important;
            }

            .menu_b:hover {
                background-color: ${colors.accent} !important;
                color: white !important;
            }

            /* Main content */
            #index {
                background-color: ${colors.cardBackground} !important;
                border-radius: 8px !important;
                padding: 15px !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            }

            #index h2 {
                color: ${colors.accent} !important;
                font-size: 18px !important;
                margin-bottom: 15px !important;
                padding-bottom: 10px !important;
                border-bottom: 1px solid ${colors.border} !important;
            }

            /* Tables */
            #index table {
                width: 100% !important;
                border-collapse: separate !important;
                border-spacing: 0 !important;
                margin-top: 10px !important;
                border-radius: 6px !important;
                overflow: hidden !important;
            }

            /* Fix for backgr class with white backgrounds */
            #index table tr.backgr, .backgr {
                background-color: ${colors.headerBackground} !important;
                color: ${colors.primaryText} !important;
                font-weight: bold !important;
                background-image: none !important;
            }

            #index table tr.backgr td {
                padding: 12px 10px !important;
                text-align: left !important;
            }

            #index table tr.gai {
                background-color: ${colors.tableEven} !important;
                transition: background-color 0.2s ease !important;
            }

            #index table tr.tum {
                background-color: ${colors.tableOdd} !important;
                transition: background-color 0.2s ease !important;
            }

            #index table tr:hover:not(.backgr) {
                background-color: ${colors.hoverColor} !important;
            }

            #index table td {
                padding: 12px 10px !important;
                border-top: 1px solid ${colors.border} !important;
            }

            /* Links */
            a, a:visited {
                color: ${colors.accent} !important;
                text-decoration: none !important;
                transition: color 0.2s ease !important;
            }

            a:hover {
                color: #64B5F6 !important;
                text-decoration: underline !important;
            }

            /* Sidebar */
            #sidebar {
                background-color: ${colors.background} !important;
                margin-top: -1% !important;
                margin-right: 0.9%
            }

            .sideblock, .sideblock2 {
                background-color: ${colors.cardBackground} !important;
                border-radius: 8px !important;
                padding: 15px !important;
                margin-bottom: 15px !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            }

            /* Arrows and indicators */
            span.green {
                color: ${colors.green} !important;
            }

            span.red {
                color: ${colors.red} !important;
            }


            /* Search box */
            input[type="text"] {
                background-color: ${colors.background} !important;
                border: 1px solid ${colors.border} !important;
                padding: 8px !important;
                color: ${colors.primaryText} !important;
                border-radius: 4px !important;
            }

            input[type="submit"] {
                background-color: ${colors.accent} !important;
                color: white !important;
                border: none !important;
                padding: 8px 12px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                transition: background-color 0.2s ease !important;
            }

            input[type="submit"]:hover {
                background-color: #1976D2 !important;
            }

            /* Footer */
            #down {
                background-color: ${colors.cardBackground} !important;
                color: ${colors.secondaryText} !important;
                padding: 0px !important;
                text-align: center !important;
                border-radius: 2px !important;
                margin-top: 15px !important;
                font-size: 12px !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            }

            /* Fix images that might have white backgrounds */
            img {
                opacity: 0.9;
                transition: opacity 0.2s ease;
            }

            img:hover {
                opacity: 1;
            }

            /* Hide specific images */
            img[src*="logo"] {
                display: none !important;
            }

            /* Fix table backgrounds on search pages */
            table[background] {
                background: none !important;
            }

            /* Make news links more visible */
            #news89, .news_title a {
                color: ${colors.accent} !important;
                font-weight: normal !important;
            }

            .news_title a:hover {
                text-decoration: underline !important;
            }

            /* Hide news table completely */
            #news_table {
                display: none !important;
            }

            /* Page width adjustment */
            #all {
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 15px !important;
            }

            /* Add some space for the fixed search box */
            body {
                padding-top: 10px !important;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                #all, #ws {
                    display: flex !important;
                    flex-direction: column !important;
                }

                #sidebar {
                    order: 2 !important;
                    width: 100% !important;
                }

                #content {
                    order: 1 !important;
                    width: 100% !important;
                }

                #menu {
                    width: 100% !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    left: 0 !important;
                    transform: none !important;
                    border-radius: 0 !important;
                }



                .menu_b {
                    padding: 10px !important;
                    font-size: 14px !important;
                }

                /* Adjust search for mobile */
                .s_search {
                    position: fixed !important;
                    top: 60px !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    border-radius: 0 !important;
                    text-align: center !important;
                    box-sizing: border-box !important;
                    padding: 10px 15px !important;
                }

                .s_search input[type="text"] {
                    width: 70% !important;
                }

                #content {
                    padding-top: 110px !important;
                }
            }



            /* Settings button */
#settings-button {
    position: fixed !important;
    top: 15px !important;
    left: -100px;
    width: 140px;
    transition: left 0.3s ease !important;
    z-index: 1001 !important;
    display: flex !important;
    align-items: center !important;
    padding: 8px 12px !important;
    background-color: ${colors.cardBackground} !important;
    border-radius: 0 8px 8px 0 !important;
    justify-content: flex-end !important; /* Прижать содержимое к правому краю */
}

#settings-button svg {
    position: absolute !important; /* Абсолютное позиционирование иконки */
    right: 10px !important; /* Отступ от правого края */
}

#settings-button {
    /* В "спрятанном" состоянии */
    justify-content: center !important;
    color: white; /* Белый цвет по умолчанию для иконки */
}

#settings-button:hover {
    left: 0 !important; /* Выезжает вплотную к левому краю */
    justify-content: flex-start !important;
    color: white; /* Белый цвет по умолчанию для иконки */
}

#settings-button .settings-text {
    opacity: 0;
    width: 0;
    overflow: hidden;
    transition: opacity 0.3s ease, width 0.3s ease;
    margin-left: 10px;
    white-space: nowrap;
    color: white;
}

#settings-button:hover .settings-text {
    opacity: 1;
    width: auto;
}

            /* Modal */
            .modal-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background-color: ${colors.modalOverlay} !important;
                z-index: 1002 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: opacity 0.3s ease, visibility 0.3s ease !important;
            }

            .modal-overlay.active {
                opacity: 1 !important;
                visibility: visible !important;
            }

            .modal {
                background-color: ${colors.modalBackground} !important;
                border-radius: 8px !important;
                padding: 20px !important;
                width: 90% !important;
                max-width: 500px !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5) !important;
                transform: translateY(-20px) !important;
                transition: transform 0.3s ease !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
            }

            .modal-overlay.active .modal {
                transform: translateY(0) !important;
            }

            .modal-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                border-bottom: 1px solid ${colors.border} !important;
                padding-bottom: 10px !important;
                margin-bottom: 15px !important;
            }

            .modal-title {
                font-size: 18px !important;
                font-weight: bold !important;
                color: ${colors.primaryText} !important;
            }

            .modal-close {
                background: none !important;
                border: none !important;
                color: ${colors.secondaryText} !important;
                font-size: 24px !important;
                cursor: pointer !important;
                padding: 0 !important;
                line-height: 1 !important;
            }

            .modal-close:hover {
                color: ${colors.accent} !important;
            }

            .modal-body {
                margin-bottom: 15px !important;
            }

            .settings-section {
                margin-bottom: 20px !important;
            }

            .settings-section-title {
                font-weight: bold !important;
                margin-bottom: 10px !important;
                color: ${colors.accent} !important;
                border-bottom: 1px solid ${colors.border} !important;
                padding-bottom: 5px !important;
            }

            .settings-option {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 8px !important;
            }

            .settings-option label {
                margin-left: 8px !important;
                cursor: pointer !important;
            }

            .settings-option input[type="checkbox"] {
                cursor: pointer !important;
            }

            .modal-footer {
                display: flex !important;
                justify-content: flex-end !important;
                gap: 10px !important;
                border-top: 1px solid ${colors.border} !important;
                padding-top: 15px !important;
            }

            .modal-button {
                background-color: ${colors.accent} !important;
                color: white !important;
                border: none !important;
                padding: 8px 16px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                transition: background-color 0.2s ease !important;
            }

            .modal-button:hover {
                background-color: #1976D2 !important;
            }

            .modal-button.secondary {
                background-color: ${colors.border} !important;
            }

            .modal-button.secondary:hover {
                background-color: #555555 !important;
            }

            /* Highlighted rows */
#index tr.HighlightText {
    background-color: rgba(76, 175, 80, 0.25) !important;
}

#index tr.HighlightText:hover {
    background-color: rgba(76, 175, 80, 0.35) !important;
}

#index tr.HighlightTextOld {
    background-color: rgba(255, 193, 7, 0.25) !important;
}

#index tr.HighlightTextOld:hover {
    background-color: rgba(255, 193, 7, 0.35) !important;
}

            /* Notification */
            .notification {
                position: fixed !important;
                bottom: 20px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background-color: ${colors.green} !important;
                color: white !important;
                padding: 10px 20px !important;
                border-radius: 4px !important;
                z-index: 9999 !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
                opacity: 1 !important;
                transition: opacity 0.5s ease !important;
            }
        `);



        // Function to create settings UI
        function createSettingsUI() {
            // Create settings button
            const settingsButton = document.createElement('button');
            settingsButton.id = 'settings-button';
            settingsButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
    <span class="settings-text">Настройки</span>
`;
            document.body.appendChild(settingsButton);

            // Create modal
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';

            const modal = document.createElement('div');
            modal.className = 'modal';
            modalOverlay.appendChild(modal);

            // Modal header
            const modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            modal.appendChild(modalHeader);

            const modalTitle = document.createElement('div');
            modalTitle.className = 'modal-title';
            modalTitle.textContent = 'Настройки Rutor Dark Theme';
            modalHeader.appendChild(modalTitle);

            const modalClose = document.createElement('button');
            modalClose.className = 'modal-close';
            modalClose.innerHTML = '&times;';
            modalHeader.appendChild(modalClose);

            // Modal body
            const modalBody = document.createElement('div');
            modalBody.className = 'modal-body';
            modal.appendChild(modalBody);

            // Category filters section
            const categorySection = document.createElement('div');
            categorySection.className = 'settings-section';
            modalBody.appendChild(categorySection);

            const categorySectionTitle = document.createElement('div');
            categorySectionTitle.className = 'settings-section-title';
            categorySectionTitle.textContent = 'Скрыть категории';
            categorySection.appendChild(categorySectionTitle);

            // Add category checkboxes
            categories.forEach(category => {
                const option = document.createElement('div');
                option.className = 'settings-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `category-${category.id}`;
                checkbox.checked = settings.hiddenCategories.includes(category.id);

                const label = document.createElement('label');
                label.htmlFor = `category-${category.id}`;
                label.textContent = category.name;

                option.appendChild(checkbox);
                option.appendChild(label);
                categorySection.appendChild(option);
            });

            // Highlight settings section
            const highlightSection = document.createElement('div');
            highlightSection.className = 'settings-section';
            modalBody.appendChild(highlightSection);

            const highlightSectionTitle = document.createElement('div');
            highlightSectionTitle.className = 'settings-section-title';
            highlightSectionTitle.textContent = 'Подсветка торрентов по году';
            highlightSection.appendChild(highlightSectionTitle);

            // Преобразование rgba в hex
            const rgbaToHex = (rgba) => {
                // Если уже hex - возвращаем как есть
                if (rgba.startsWith('#')) return rgba;

                const matches = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
                if (!matches) return '#00ff00'; // Зеленый по умолчанию

                const r = parseInt(matches[1]);
                const g = parseInt(matches[2]);
                const b = parseInt(matches[3]);

                return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            };

            // Current year highlight option
            const currentYearOption = document.createElement('div');
            currentYearOption.className = 'settings-option';

            const currentYearCheckbox = document.createElement('input');
            currentYearCheckbox.type = 'checkbox';
            currentYearCheckbox.id = 'highlight-current-year';
            currentYearCheckbox.checked = settings.highlightCurrentYear;

            const currentYearLabel = document.createElement('label');
            currentYearLabel.htmlFor = 'highlight-current-year';
            currentYearLabel.textContent = `Подсвечивать торренты текущего года (${getCurrentYear()}) Цвет`;

            // В месте создания color input для текущего года
            const currentYearColorInput = document.createElement('input');
            currentYearColorInput.type = 'color';
            currentYearColorInput.id = 'current-year-color';
            currentYearColorInput.style.display = 'none';

            // Используем значение из настроек или дефолтное
            const currentYearColor = rgbaToHex(settings.currentYearHighlightColor || 'rgba(76, 175, 80, 0.25)');
            currentYearColorInput.value = currentYearColor;

            const currentYearColorIndicator = document.createElement('div');
            currentYearColorIndicator.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-left: 10px;
    display: inline-block;
    cursor: pointer;
    background-color: ${currentYearColor}
`;

            // Клик по индикатору открывает color picker
            currentYearColorIndicator.addEventListener('click', () => {
                createCustomColorPicker(
                    currentYearColorIndicator.style.backgroundColor,
                    (color) => {
                        currentYearColorIndicator.style.backgroundColor = color;
                        currentYearColorInput.value = color;
                    }
                );
            });

            // Обновление цвета при изменении
            currentYearColorInput.addEventListener('change', (e) => {
                currentYearColorIndicator.style.backgroundColor = e.target.value;
            });

            currentYearOption.appendChild(currentYearCheckbox);
            currentYearOption.appendChild(currentYearLabel);
            currentYearOption.appendChild(currentYearColorInput);
            currentYearOption.appendChild(currentYearColorIndicator);
            highlightSection.appendChild(currentYearOption);

            // Previous year highlight option
            const previousYearOption = document.createElement('div');
            previousYearOption.className = 'settings-option';

            const previousYearCheckbox = document.createElement('input');
            previousYearCheckbox.type = 'checkbox';
            previousYearCheckbox.id = 'highlight-previous-year';
            previousYearCheckbox.checked = settings.highlightPreviousYear;

            const previousYearLabel = document.createElement('label');
            previousYearLabel.htmlFor = 'highlight-previous-year';
            previousYearLabel.textContent = `Подсвечивать торренты прошлого года (${getPreviousYear()}) Цвет`;

            // Аналогично для прошлого года
            const previousYearColorInput = document.createElement('input');
            previousYearColorInput.type = 'color';
            previousYearColorInput.id = 'previous-year-color';
            previousYearColorInput.style.display = 'none';

            const previousYearColor = rgbaToHex(settings.previousYearHighlightColor || 'rgba(255, 193, 7, 0.25)');
            previousYearColorInput.value = previousYearColor;

            const previousYearColorIndicator = document.createElement('div');
            previousYearColorIndicator.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-left: 10px;
    display: inline-block;
    cursor: pointer;
    background-color: ${previousYearColor}
`;

            // Клик по индикатору открывает color picker
            previousYearColorIndicator.addEventListener('click', () => {
                createCustomColorPicker(
                    previousYearColorIndicator.style.backgroundColor,
                    (color) => {
                        previousYearColorIndicator.style.backgroundColor = color;
                        previousYearColorInput.value = color;
                    }
                );
            });

            // Обновление цвета при изменении
            previousYearColorInput.addEventListener('change', (e) => {
                previousYearColorIndicator.style.backgroundColor = e.target.value;
            });

            previousYearOption.appendChild(previousYearCheckbox);
            previousYearOption.appendChild(previousYearLabel);
            previousYearOption.appendChild(previousYearColorInput);
            previousYearOption.appendChild(previousYearColorIndicator);
            highlightSection.appendChild(previousYearOption);

            // Modal footer
            const modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modal.appendChild(modalFooter);

            const saveButton = document.createElement('button');
            saveButton.className = 'modal-button';
            saveButton.textContent = 'Сохранить';
            modalFooter.appendChild(saveButton);

            const cancelButton = document.createElement('button');
            cancelButton.className = 'modal-button secondary';
            cancelButton.textContent = 'Отмена';
            modalFooter.appendChild(cancelButton);

            // Add to document
            document.body.appendChild(modalOverlay);

            // Event listeners
            settingsButton.addEventListener('click', () => {
                modalOverlay.classList.add('active');
            });

            modalClose.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });

            cancelButton.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });

            saveButton.addEventListener('click', () => {
                // Преобразование rgba/rgb/hex в hex
                const normalizeColor = (color) => {
                    // Если цвет уже в hex - возвращаем как есть
                    if (color.startsWith('#')) return color;

                    // Парсим rgba/rgb
                    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                    if (rgbMatch) {
                        const r = parseInt(rgbMatch[1]);
                        const g = parseInt(rgbMatch[2]);
                        const b = parseInt(rgbMatch[3]);
                        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                    }

                    // Fallback
                    return '#000000';
                };

                // Преобразование hex в rgba с прозрачностью
                const hexToRgba = (hex, alpha = 0.25) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                // Update settings
                const newSettings = {
                    hiddenCategories: [],
                    highlightCurrentYear: currentYearCheckbox.checked,
                    highlightPreviousYear: previousYearCheckbox.checked,
                    currentYearHighlightColor: hexToRgba(normalizeColor(currentYearColorIndicator.style.backgroundColor)),
                    previousYearHighlightColor: hexToRgba(normalizeColor(previousYearColorIndicator.style.backgroundColor)),
                    currentYearHighlightHoverColor: hexToRgba(normalizeColor(currentYearColorIndicator.style.backgroundColor), 0.35),
                    previousYearHighlightHoverColor: hexToRgba(normalizeColor(previousYearColorIndicator.style.backgroundColor), 0.35)
                };

                // Get hidden categories
                categories.forEach(category => {
                    const checkbox = document.getElementById(`category-${category.id}`);
                    if (checkbox && checkbox.checked) {
                        newSettings.hiddenCategories.push(category.id);
                    }
                });

                // Сохраняем настройки
                settings = newSettings;
                GM_setValue('rutorSettings', settings);

                // Apply new settings
                applySettings();

                // Show a notification
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = 'Настройки сохранены';
                document.body.appendChild(notification);

                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => notification.remove(), 500);
                }, 3000);

                // Close modal
                modalOverlay.classList.remove('active');
            });
        }

        // Apply settings to modify the page
        function applySettings() {


            // Current and previous years for highlighting
            const currentYear = getCurrentYear();
            const previousYear = getPreviousYear();

            // 1. Handle category hiding (directly via jQuery)
            categories.forEach(category => {
                if (settings.hiddenCategories.includes(category.id)) {
                    $(`h2:contains("${category.text}")`).hide();
                    $(`h2:contains("${category.text}")`).each(function() {
                        let $next = $(this).next();
                        while ($next.length && !$next.is('h2')) {
                            if ($next.is('table')) {
                                $next.hide();
                            }
                            $next = $next.next();
                        }
                    });
                } else {
                    $(`h2:contains("${category.text}")`).show();
                    $(`h2:contains("${category.text}")`).each(function() {
                        let $next = $(this).next();
                        while ($next.length && !$next.is('h2')) {
                            if ($next.is('table')) {
                                $next.show();
                            }
                            $next = $next.next();
                        }
                    });
                }
            });

            // 2. Apply year highlighting
            $('#index tr').removeClass('current-year-highlight previous-year-highlight');

            if (settings.highlightCurrentYear) {
                $('#index tr').filter(function() {
                    const rowText = $(this).text();
                    return rowText.includes(currentYear.toString());
                }).addClass('current-year-highlight');
            }

            if (settings.highlightPreviousYear) {
                $('#index tr').filter(function() {
                    const rowText = $(this).text();
                    return rowText.includes(previousYear.toString());
                }).addClass('previous-year-highlight');
            }

            // Динамическая генерация CSS для кастомных цветов
            const customCSS = `
    /* Подсветка текущего года */
    #index tr.current-year-highlight,
    #index table tr.current-year-highlight {
        background-color: ${settings.currentYearHighlightColor} !important;
    }
    #index tr.current-year-highlight:hover,
    #index table tr.current-year-highlight:hover {
        background-color: ${settings.currentYearHighlightHoverColor} !important;
    }

    /* Подсветка прошлого года */
    #index tr.previous-year-highlight,
    #index table tr.previous-year-highlight {
        background-color: ${settings.previousYearHighlightColor} !important;
    }
    #index tr.previous-year-highlight:hover,
    #index table tr.previous-year-highlight:hover {
        background-color: ${settings.previousYearHighlightHoverColor} !important;
    }
    `;

            // Удаляем предыдущий кастомный стиль, если он есть
            $('#custom-highlight-style').remove();

            // Добавляем новый кастомный стиль
            $('head').append(`<style id="custom-highlight-style">${customCSS}</style>`);


        }

        // Дополнительный CSS для подсветки
        GM_addStyle(`

        /* Центрирование color picker */
    input[type="color"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 300px !important;
        height: 250px !important;
        z-index: 9999 !important;
        background: #2c2c2c !important;
        border-radius: 8px !important;
        padding: 10px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    }

    /* Удаляем стандартные стили */
    input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0 !important;
    }
    input[type="color"]::-webkit-color-swatch {
        border: none !important;
        border-radius: 4px !important;
    }

    /* Подсветка текущего года */
    #index tr.current-year-highlight,
    #index table tr.current-year-highlight {
        background-color: rgba(76, 175, 80, 0.25) !important;
    }
    #index tr.current-year-highlight:hover,
    #index table tr.current-year-highlight:hover {
        background-color: rgba(76, 175, 80, 0.35) !important;
    }

    /* Подсветка прошлого года */
    #index tr.previous-year-highlight,
    #index table tr.previous-year-highlight {
        background-color: rgba(255, 193, 7, 0.25) !important;
    }
    #index tr.previous-year-highlight:hover,
    #index table tr.previous-year-highlight:hover {
        background-color: rgba(255, 193, 7, 0.35) !important;
    }
`);

        // Replace download icon with a cleaner one
        function replaceDownloadIcons() {
            $('img[src*="d.gif"]').each(function() {
                const downloadSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${colors.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>`;

                $(this).replaceWith(`<span style="display:inline-block; margin-right:5px; vertical-align:middle;">${downloadSVG}</span>`);
            });
        }

        // Move search box to top left
        function relocateSearchBox() {
            // Check if we're on a search page
            const isSearchPage = window.location.href.includes('/search/') ||
                  window.location.href.includes('/b.php?') ||
                  window.location.href.includes('/torrent/') ||
                  window.location.pathname === '/b.php';

            // Find the sidebar search block
            const sidebarSearchBlock = document.querySelector('.sideblock:has(table[background*="poisk_bg.gif"])');
            // Alternative selector using XPath equivalent
            const sidebarSearchBlockAlt = document.querySelector('#sidebar > div:nth-child(2)');

            // If we're on a search page, hide the sidebar search and don't add our custom search
            if (isSearchPage) {
                console.log('Находимся на странице поиска, скрываем все элементы поиска');

                // Hide sidebar search using both selectors for better coverage
                if (sidebarSearchBlock) {
                    sidebarSearchBlock.style.display = 'none';
                }
                if (sidebarSearchBlockAlt) {
                    sidebarSearchBlockAlt.style.display = 'none';
                }

                return;
            }

            // For non-search pages, continue with creating and showing our custom search

            if (!sidebarSearchBlock && !sidebarSearchBlockAlt) {
                console.error('Search block not found');
                return;
            }

            // Find the index div where we want to move the search
            const indexDiv = document.querySelector('#index');

            if (!indexDiv) {
                console.error('Target #index div not found');
                return;
            }

            // Create a container for the search that will be positioned to the right
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container-right';
            searchContainer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 280px;
        background-color: ${colors.cardBackground};
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 100;
    `;

            // Создаём содержимое контейнера с инлайн-стилем
            searchContainer.innerHTML = `
        <div style="display: flex; width: 100%; gap: 8px; align-items: center;">
            <input type="text" id="search-input" style="
                flex: 1;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid ${colors.border};
                background-color: ${colors.background};
                color: ${colors.primaryText};
                box-sizing: border-box;
                min-width: 0;
            ">
            <button id="search-button" style="
                background-color: ${colors.accent};
                color: white;
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
                transition: background-color 0.2s;
                flex-shrink: 0;
            ">Искать</button>
        </div>
    `;

            // Add the search container to the index div
            indexDiv.appendChild(searchContainer);

            // Also set position relative on index div if it isn't already
            if (window.getComputedStyle(indexDiv).position === 'static') {
                indexDiv.style.position = 'relative';
            }

            // Получаем ссылки на элементы
            const searchInput = searchContainer.querySelector('#search-input');
            const searchButton = searchContainer.querySelector('#search-button');

            // Функция для выполнения поиска
            const performSearch = () => {
                const searchText = searchInput.value;
                if (searchText && searchText.trim() !== '') {
                    window.location.href = '/search/' + encodeURIComponent(searchText);
                }
            };

            // Configure hover effect for button
            searchButton.addEventListener('mouseover', () => {
                searchButton.style.backgroundColor = '#1976D2';
            });
            searchButton.addEventListener('mouseout', () => {
                searchButton.style.backgroundColor = colors.accent;
            });

            // Configure click event for button
            searchButton.addEventListener('click', performSearch);

            // Add keypress event for Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });

            // На обычных страницах скрываем оригинальный поиск из сайдбара
            // Используем оба селектора для надежности
            if (sidebarSearchBlock) {
                sidebarSearchBlock.style.display = 'none';
            }
            if (sidebarSearchBlockAlt) {
                sidebarSearchBlockAlt.style.display = 'none';
            }

            // Make the container responsive
            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    searchContainer.style.width = 'calc(100% - 20px)';
                    searchContainer.style.right = '10px';
                    searchContainer.style.padding = '10px';
                } else {
                    searchContainer.style.width = '280px';
                    searchContainer.style.right = '10px';
                    searchContainer.style.padding = '15px';
                }
            });
        }


        function createCustomColorPicker(initialColor, onSelect) {
            // Создаем overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

            // Создаем контейнер color picker
            const pickerContainer = document.createElement('div');
            pickerContainer.style.cssText = `
        background: #2c2c2c;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

            // Создаем холст
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 200;
            canvas.style.borderRadius = '4px';
            const ctx = canvas.getContext('2d');

            // Создаем градиент
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, 'red');
            gradient.addColorStop(0.15, 'yellow');
            gradient.addColorStop(0.33, 'green');
            gradient.addColorStop(0.49, 'cyan');
            gradient.addColorStop(0.67, 'blue');
            gradient.addColorStop(0.84, 'magenta');
            gradient.addColorStop(1, 'red');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Создаем затемнение
            const blackWhiteGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            blackWhiteGradient.addColorStop(0, 'rgba(0,0,0,0)');
            blackWhiteGradient.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = blackWhiteGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Текущий выбранный цвет
            const colorDisplay = document.createElement('div');
            colorDisplay.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-top: 10px;
        background-color: ${initialColor};
    `;

            // Обработка клика
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const imageData = ctx.getImageData(x, y, 1, 1);
                const [r, g, b] = imageData.data;
                const selectedColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

                colorDisplay.style.backgroundColor = selectedColor;
            });

            // Кнопки
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 10px;
    `;

            const selectButton = document.createElement('button');
            selectButton.textContent = 'Выбрать';
            selectButton.style.cssText = `
        background-color: #2196F3;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
    `;

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Отмена';
            cancelButton.style.cssText = `
        background-color: #888;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
    `;

            selectButton.addEventListener('click', () => {
                onSelect(colorDisplay.style.backgroundColor);
                document.body.removeChild(overlay);
            });

            cancelButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            buttonsContainer.appendChild(selectButton);
            buttonsContainer.appendChild(cancelButton);

            pickerContainer.appendChild(canvas);
            pickerContainer.appendChild(colorDisplay);
            pickerContainer.appendChild(buttonsContainer);

            overlay.appendChild(pickerContainer);
            document.body.appendChild(overlay);
        }


        // Функция для определения стилей на странице поиска
        function applySearchPageStyles() {
            // Проверяем, находимся ли мы на странице поиска
            const isSearchPage = window.location.href.includes('/search/') ||
                  window.location.href.includes('/b.php?') ||
                  window.location.pathname === '/b.php';

            if (!isSearchPage) {
                return; // Если не на странице поиска, выходим из функции
            }

            // Добавляем стили для элементов страницы поиска
            GM_addStyle(`
        /* Стилизация выпадающих списков */
        select {
            background-color: ${colors.cardBackground} !important;
            color: ${colors.primaryText} !important;
            border: 1px solid ${colors.border} !important;
            padding: 8px !important;
            border-radius: 4px !important;
            appearance: none !important;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%23e0e0e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>') !important;
            background-repeat: no-repeat !important;
            background-position: right 8px center !important;
            padding-right: 30px !important;
            cursor: pointer !important;
        }

        select:hover {
            border-color: ${colors.accent} !important;
        }

        /* Стилизация чекбоксов */
        input[type="checkbox"] {
            appearance: none !important;
            -webkit-appearance: none !important;
            width: 18px !important;
            height: 18px !important;
            background-color: ${colors.background} !important;
            border: 1px solid ${colors.border} !important;
            border-radius: 3px !important;
            cursor: pointer !important;
            vertical-align: middle !important;
            position: relative !important;
            margin-right: 5px !important;
        }

        input[type="checkbox"]:checked {
            background-color: ${colors.accent} !important;
            border-color: ${colors.accent} !important;
        }

        input[type="checkbox"]:checked:after {
            content: '' !important;
            position: absolute !important;
            left: 6px !important;
            top: 2px !important;
            width: 4px !important;
            height: 10px !important;
            border: solid white !important;
            border-width: 0 2px 2px 0 !important;
            transform: rotate(45deg) !important;
        }

        /* Стилизация текстовых полей на странице поиска */
        input[type="text"] {
            background-color: ${colors.background} !important;
            color: ${colors.primaryText} !important;
            border: 1px solid ${colors.border} !important;
            padding: 8px 10px !important;
            border-radius: 4px !important;
            box-shadow: none !important;
        }

        input[type="text"]:focus {
            border-color: ${colors.accent} !important;
            outline: none !important;
        }

        /* Стилизация кнопок на странице поиска */
        input[type="submit"], button:not(#search-button) {
            background-color: ${colors.accent} !important;
            color: white !important;
            border: none !important;
            padding: 8px 15px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-weight: normal !important;
            transition: background-color 0.2s ease !important;
        }

        input[type="submit"]:hover, button:not(#search-button):hover {
            background-color: #1976D2 !important;
        }

        /* Стилизация меток для чекбоксов */
        label {
            color: ${colors.primaryText} !important;
            cursor: pointer !important;
            vertical-align: middle !important;
        }

        /* Стилизация таблиц и строк на странице поиска */
        table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
            border-radius: 6px !important;
            overflow: hidden !important;
        }

        /* Стилизация фона страницы поиска */
        body, html, form {
            background-color: ${colors.background} !important;
        }

        /* Стилизация контейнеров */
        div, td {
            color: ${colors.primaryText} !important;
        }

        /* Убираем белый фон у элементов с background атрибутом */
        [background] {
            background: none !important;
        }

        /* Стилизация заголовков */
        h1, h2, h3, h4, h5, h6 {
            color: ${colors.accent} !important;
        }
    `);

    // Функция для замены стандартных чекбоксов на стилизованные
    function enhanceCheckboxes() {
        // Находим все чекбоксы
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        // Для каждого чекбокса добавляем обработчик клика
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('click', () => {
                // Добавляем небольшую задержку для анимации
                setTimeout(() => {
                    if (checkbox.checked) {
                        checkbox.style.backgroundColor = colors.accent;
                    } else {
                        checkbox.style.backgroundColor = colors.background;
                    }
                }, 50);
            });
        });
    }

    // Запускаем улучшение чекбоксов после загрузки страницы
    window.addEventListener('load', enhanceCheckboxes);

    // Еще можно подтянуть стиль для таблицы результатов поиска, если она есть
    const searchResultsTable = document.querySelector('table.embedded');
    if (searchResultsTable) {
        searchResultsTable.style.cssText = `
            width: 100% !important;
            background-color: ${colors.cardBackground} !important;
            border-radius: 8px !important;
            margin-top: 20px !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
        `;

        // Стилизация строк таблицы результатов
        const rows = searchResultsTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index === 0) { // Заголовок таблицы
                row.style.cssText = `
                    background-color: ${colors.headerBackground} !important;
                    color: ${colors.primaryText} !important;
                    font-weight: bold !important;
                `;
            } else if (index % 2 === 0) { // Четные строки
                row.style.cssText = `
                    background-color: ${colors.tableEven} !important;
                    transition: background-color 0.2s ease !important;
                `;
            } else { // Нечетные строки
                row.style.cssText = `
                    background-color: ${colors.tableOdd} !important;
                    transition: background-color 0.2s ease !important;
                `;
            }

            // Добавляем эффект при наведении
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = colors.hoverColor;
            });

            row.addEventListener('mouseout', () => {
                if (index === 0) {
                    row.style.backgroundColor = colors.headerBackground;
                } else if (index % 2 === 0) {
                    row.style.backgroundColor = colors.tableEven;
                } else {
                    row.style.backgroundColor = colors.tableOdd;
                }
            });
        });
    }
}

        // Функция для улучшения вида формы с скрытием fieldset
        function enhanceFormAppearance() {
            // Проверяем, находимся ли мы на странице поиска
            const isSearchPage = window.location.href.includes('/search/') ||
                  window.location.href.includes('/b.php?') ||
                  window.location.pathname === '/b.php';

            if (!isSearchPage) {
                return;
            }

            // Добавляем стили прямо внутри функции
            GM_addStyle(`
        /* Скрываем fieldset и его границы */
        #content fieldset, fieldset {
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Скрываем legend (заголовок fieldset) */
        #content fieldset legend, fieldset legend {
            display: none !important;
        }

        /* Заменяем белую рамку */
        input, select, textarea, table, tr, td, form, button, body, html, #ws, #content, #all {
            border-color: ${colors.border} !important;
        }

        /* Стилизация основных контейнеров */
        #ws, #content, #all {
            border: none !important;
            box-shadow: none !important;
        }

        /* Специальный стиль для внешнего контейнера формы поиска */
        form, table[width="100%"] {
            border: 1px solid ${colors.border} !important;
            border-radius: 8px !important;
            background-color: ${colors.cardBackground} !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            padding: 15px !important;
            margin-bottom: 20px !important;
        }

        /* Корректируем стиль отступов внутри формы */
        form td {
            padding: 5px !important;
        }

        /* Улучшаем отображение группы элементов формы */
        td > input + input, td > select + select {
            margin-left: 10px !important;
        }

        /* Улучшаем отображение кнопки отправки */
        input[type="submit"] {
            margin-top: 10px !important;
        }

        /* Убираем белый фон у элементов с background атрибутом */
        [background] {
            background: none !important;
        }
    `);

    // Находим и скрываем fieldset
    const fieldsets = document.querySelectorAll('fieldset');
    if (fieldsets.length > 0) {
        fieldsets.forEach(fieldset => {
            // Убираем границу
            fieldset.style.border = 'none';
            fieldset.style.margin = '0';
            fieldset.style.padding = '0';

            // Скрываем legend если он есть
            const legend = fieldset.querySelector('legend');
            if (legend) {
                legend.style.display = 'none';
            }
        });
    }

    // Находим основную форму поиска
    const searchForm = document.querySelector('form');
    if (searchForm) {
        // Добавляем класс для лучшей стилизации
        searchForm.classList.add('enhanced-form');

        // Удаляем атрибуты border и background у таблиц внутри формы
        const tables = searchForm.querySelectorAll('table');
        tables.forEach(table => {
            table.removeAttribute('border');
            table.removeAttribute('background');
            table.style.cssText = 'border: none !important; background: none !important;';

            // Удаляем border и background у ячеек таблицы
            const cells = table.querySelectorAll('td');
            cells.forEach(cell => {
                cell.removeAttribute('border');
                cell.removeAttribute('background');
                cell.style.cssText = 'border: none !important; background: none !important;';
            });
        });

        // Находим все строки в таблицах
        const rows = searchForm.querySelectorAll('tr');
        rows.forEach(row => {
            row.style.cssText = 'border: none !important; background: none !important;';
        });
    }

    // Если есть белая рамка у основного контейнера, меняем ее
    const mainContainer = document.querySelector('#all');
    if (mainContainer) {
        mainContainer.style.border = 'none';
        mainContainer.style.boxShadow = 'none';
    }
}

       function styleCommentsTable() {
    const commentCells = document.querySelectorAll('td.c_t[colspan="4"]');

    commentCells.forEach(cell => {
        cell.style.cssText = `
            background-color: ${colors.background} !important;
            color: ${colors.primaryText} !important;
            padding: 10px !important;
        `;

        // Дополнительная стилизация ссылок внутри ячейки
        const links = cell.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = colors.accent;
            link.style.textDecoration = 'none';
        });

        // Стилизация смайликов
        const smilies = cell.querySelectorAll('img[src*="smilies"]');
        smilies.forEach(smiley => {
            smiley.style.filter = 'brightness(0.8)';
        });
    });
}

        // Функция для стилизации страницы с деталями торрента
        function enhanceTorrentPage() {
            // Проверяем, находимся ли мы на странице деталей торрента
            const isTorrentPage = window.location.href.includes('/torrent/') ||
                  window.location.href.includes('/tor/') ||
                  document.querySelector('.d.download');

            if (!isTorrentPage) {
                return;
            }

            // Добавляем стили прямо внутри функции
            GM_addStyle(`

        /* Основные элементы страницы */
        body, html, #all, #ws, #content, .download {
            background-color: ${colors.background} !important;
            color: ${colors.primaryText} !important;
        }

        /* Контейнер деталей торрента */
        #index, .download, .download_title, .download_wrap {
            background-color: ${colors.cardBackground} !important;
            border-radius: 8px !important;
            padding: 15px !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            border: 1px solid ${colors.border} !important;
            margin-bottom: 20px !important;
        }

        /* Заголовок торрента */
        .download_title, h1, h2, h3 {
            color: ${colors.accent} !important;
            font-size: 20px !important;
            font-weight: bold !important;
            padding-bottom: 10px !important;
            margin-bottom: 15px !important;
            border-bottom: 1px solid ${colors.border} !important;
        }

        /* Описание и детали */
        .download_wrap p, .download_wrap div {
            color: ${colors.primaryText} !important;
            line-height: 1.5 !important;
        }

        /* Изображения постеров */
        .download_wrap img {
            border-radius: 4px !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5) !important;
        }

        /* Ссылки */
        a, a:visited {
            color: ${colors.accent} !important;
            text-decoration: none !important;
            transition: color 0.2s ease !important;
        }

        a:hover {
            color: #64B5F6 !important;
            text-decoration: underline !important;
        }

        /* Кнопки скачивания */
        .download a.button, .download_button, a.download {
            background-color: ${colors.accent} !important;
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 4px !important;
            border: none !important;
            display: inline-block !important;
            font-weight: bold !important;
            margin: 10px 0 !important;
            text-align: center !important;
            transition: background-color 0.2s ease !important;
        }

        .download a.button:hover, .download_button:hover, a.download:hover {
            background-color: #1976D2 !important;
            text-decoration: none !important;
        }

        /* Технические детали торрента (размер, сидеры и т.д.) */
        .technical_details, .tech_details, .torrent_info {
            background-color: ${colors.tableOdd} !important;
            padding: 10px !important;
            border-radius: 4px !important;
            margin: 10px 0 !important;
        }

        /* Таблицы с информацией */
        table {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
            margin-top: 10px !important;
            border-radius: 6px !important;
            overflow: hidden !important;
        }

        table tr:nth-child(odd) {
            background-color: ${colors.tableOdd} !important;
        }

        table tr:nth-child(even) {
            background-color: ${colors.tableEven} !important;
        }

        table td, table th {
            padding: 8px 10px !important;
            border-top: 1px solid ${colors.border} !important;
        }

        /* Рейтинги и оценки */
        .ratings, .rating {
            display: inline-block !important;
            background-color: ${colors.tableEven} !important;
            padding: 5px 10px !important;
            border-radius: 4px !important;
            margin-right: 10px !important;
        }

        /* Комментарии */
        .comments, .comment_section {
            margin-top: 20px !important;
            border-top: 1px solid ${colors.border} !important;
            padding-top: 20px !important;
        }
        .hidewrap .hidehead {
        background-image: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    cursor: pointer !important;
}

.hidewrap .hidehead::after {
    content: '▼';
    color: ${colors.accent};
    transition: transform 0.3s ease;
}

.hidewrap.active .hidehead::after {
    transform: rotate(180deg);
}



        /* Выделения для жанров и другой мета-информации */
        .genre, .year, .quality, .tag {
            display: inline-block !important;
            background-color: ${colors.border} !important;
            color: ${colors.primaryText} !important;
            padding: 3px 8px !important;
            border-radius: 3px !important;
            margin-right: 5px !important;
            margin-bottom: 5px !important;
            font-size: 12px !important;
        }

        /* Скрываем ненужные элементы */
        iframe, ins, .ads, div[id^="ads_"], div[id*="_ads"] {
            display: none !important;
        }
    `);

    // Находим и улучшаем элементы на странице
    const downloadTitle = document.querySelector('.download_title, h1');
    if (downloadTitle) {
        downloadTitle.style.color = colors.accent;
        downloadTitle.style.fontSize = '22px';
    }

    // Улучшаем контейнер с деталями
    const detailsContainer = document.querySelector('#content, .download, .download_wrap');
    if (detailsContainer) {
        detailsContainer.style.backgroundColor = colors.cardBackground;
        detailsContainer.style.borderRadius = '8px';
        detailsContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        detailsContainer.style.padding = '15px';
    }
styleCommentsTable();
const hideWraps = document.querySelectorAll('.hidewrap');
hideWraps.forEach(hideWrap => {
    hideWrap.style.cssText = `
        background-color: ${colors.tableOdd} !important;
        border-radius: 8px !important;
        margin-bottom: 15px !important;
        border: 1px solid ${colors.border} !important; // Легкая рамка для визуального выделения
        overflow: hidden !important;
    `;

    const hideHead = hideWrap.querySelector('.hidehead');
    if (hideHead) {
        // Удаляем картинку с плюсом/минусом через CSS
        hideHead.style.cssText = `
            cursor: pointer !important;
            padding: 10px 15px !important;
            background-color: ${colors.headerBackground} !important;
            color: ${colors.accent} !important;
            position: relative !important;
            background-image: none !important; // Удаляем фоновую картинку
        `;

        // Создаем элемент с синей стрелкой слева
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            position: absolute !important;
            left: 10px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 16px !important;
            height: 16px !important;

            background-repeat: no-repeat !important;
            background-position: center !important;
            pointer-events: none !important;
        `;

        hideHead.insertBefore(arrow, hideHead.firstChild);

        // Сохраняем оригинальный onclick
        hideHead.setAttribute('onclick', 'hideshow($(this))');
    }

    const hideBody = hideWrap.querySelector('.hidebody');
    if (hideBody) {
        hideBody.style.cssText = `
            background-color: ${colors.background} !important;
            color: ${colors.primaryText} !important;
            padding: 15px !important;
            border-top: 1px solid ${colors.border} !important; // Разделительная линия
        `;
    }

    const hideArea = hideWrap.querySelector('.hidearea');
    if (hideArea) {
        hideArea.style.cssText = `
            width: 100% !important;
            background-color: ${colors.background} !important;
            color: ${colors.primaryText} !important;
            border: none !important;
            padding: 10px !important;
            min-height: 100px !important;
            resize: none !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
        `;
    }

    // Добавьте эту проверку
    if (document.querySelector('table[width="100%"][cellspacing="0"][cellpadding="4"]')) {
        styleCommentsTable();
    } else {
        console.error('Таблица комментариев не найдена на странице');
    }
});

    // Улучшаем ссылки скачивания
    const downloadLinks = document.querySelectorAll('a.download, .download a.button, .download_button');
    downloadLinks.forEach(link => {
        link.style.backgroundColor = colors.accent;
        link.style.color = 'white';
        link.style.padding = '10px 15px';
        link.style.borderRadius = '4px';
        link.style.display = 'inline-block';
        link.style.fontWeight = 'bold';
        link.style.margin = '10px 0';
        link.style.textDecoration = 'none';

        link.addEventListener('mouseover', () => {
            link.style.backgroundColor = '#1976D2';
        });

        link.addEventListener('mouseout', () => {
            link.style.backgroundColor = colors.accent;
        });
    });

    // Находим все блоки с техническими деталями
    const techDetails = document.querySelectorAll('table, .technical_details, .tech_details');
    techDetails.forEach(detail => {
        detail.style.backgroundColor = colors.tableOdd;
        detail.style.borderRadius = '4px';
        detail.style.padding = '10px';
        detail.style.margin = '10px 0';
    });
}

        // Для большей гарантии, добавим специфичный CSS прямо в head
function addExtraStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        /* Экстренный CSS для #download */
        #download, div#download, .d.download {
            background-color: ${colors.cardBackground} !important;
            border: 1px solid ${colors.border} !important;
            border-radius: 8px !important;
            padding: 10px !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            margin-bottom: 15px !important;
            color: ${colors.primaryText} !important;
        }
    `;
    document.head.appendChild(styleEl);
}

        // Initialize the script
        function initialize() {

            document.querySelector('#all').style.display = 'none';
            document.querySelector('#sidebar > div:first-child').style.display = 'none';
            document.querySelector('#sidebar > div:nth-child(3)').style.display = 'none';
            document.querySelector('#sidebar > div:nth-child(4)').style.display = 'none';


            $('#content').css({ 'position': 'absolute', 'left': '10px' , 'right': '10px' });

            // Create settings UI
            createSettingsUI();

            // Replace download icons
            replaceDownloadIcons();

            // Relocate search box
            relocateSearchBox();

            // Add smooth transitions
            $('body').css('transition', 'background-color 0.3s ease');

            // Apply settings
            applySettings();

            // Apply specific styles for search page
            applySearchPageStyles();

            enhanceFormAppearance();

            // Enhance torrent page
            enhanceTorrentPage();
            addExtraStyles();
            // Hide news table if exists
            $('#news_table').hide();

            // Fix background color for .backgr elements
            $('.backgr').css({
                'backgroundImage': 'none',
                'backgroundColor': colors.headerBackground
            });
        }

        // Run when document is ready
        $(document).ready(function() {
            initialize();
        });
    }
})();
