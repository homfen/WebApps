const {ipcRenderer} = require('electron');
const TabGroup = require("electron-tabs");
const $ = require("jquery");

let tabs = getStore();
let tabGroup = new TabGroup();
tabGroup.on('tab-removed', tab => {
    let title = tab.title;
    tabs = tabs.filter(tab => tab.name !== title);
    setStore(tabs);
});
tabs.map((tab, index) => {
    addTab(tab, index);
});

$(() => {
    $('.add').on('click', () => {
        $('.mask').show();
        $('.add-dialog').show();
    });
    $('.submit').on('click', () => {
        let name = $('#name').val().trim();
        let url = $('#url').val().trim();
        let useragent = $('#useragent').val().trim();
        if (!name || !url) {
            alert('Please enter name and url.');
            return;
        }
        let exist = tabs.filter(tab => tab.name === name || tab.url === url);
        if (exist.length) {
            alert('Name or url duplicated.');
            return;
        }
        let tab = {
            name,
            url,
            useragent
        };
        tabs.push(tab);
        setStore(tabs);
        addTab(tab, tabs.length - 1);
        $('.mask').hide();
        $('.add-dialog').hide();
    });
    $('.cancel').on('click', () => {
        $('.mask').hide();
        $('.add-dialog').hide();
    });
    $('.back').on('click', () => {
        let active = tabGroup.getActiveTab();
        active.webview.goBack();
    });
    $('.forward').on('click', () => {
        let active = tabGroup.getActiveTab();
        active.webview.goForward();
    });
    $('.refresh').on('click', () => {
        let active = tabGroup.getActiveTab();
        active.webview.reload();
    });
    $('.close').on('click', () => {
        ipcRenderer.send('close');
    });
});

function getStore() {
    let tabs = localStorage.getItem('tabs');
    if (tabs) {
        return JSON.parse(tabs);
    }
    let defaultTabs = [
        {
            name: 'QQ',
            url: 'http://web2.qq.com'
        },
        {
            name: '微信',
            url: 'http://wx.qq.com'
        }
    ];
    setStore(defaultTabs);
    return defaultTabs;
}

function setStore(tabs) {
    localStorage.setItem('tabs', JSON.stringify(tabs));
}

function addTab(tab, index) {
    let newTab = tabGroup.addTab({
        title: tab.name,
        src: tab.url,
        webviewAttributes: {
            useragent: tab.useragent || ''
        },
        visible: true,
        closable: true,
        active: index === 0,
    });
    if (!/-Popup$/.test(tab.name)) {
        newTab.webview.addEventListener('new-window', ({url, frameName}) => {
            if (frameName !== '_self') {
                let name = `${tab.name}-Popup`;
                let popupTab = {url, name};
                tabs.push(popupTab);
                addTab(popupTab, tabs.length - 1);
            }
        });
    }
}

