'use strict';
const Utils = require('../utils');
const Chat = require('../models/chat');

let _bot = null;

module.exports = function (bot) {
    _bot = bot;
    bot.onText(/^\/groups$/, onGroups);
    bot.on('new_chat_participant', onAddToChat);
    bot.on('group_chat_created', onAddToChat);
    bot.on('left_chat_participant', onRemoveFromChat);
    bot.on('callback_query', onGroupAnswer);
};

function onGroups(msg) {
    if (msg.chat.id !== msg.from.id) return;//disable for groups;
    Chat.find({
        adminId: msg.from.id
    }).then(list => {
        if (!list || !list.length) return _bot.sendMessage(msg.chat.id, 'Сначала надо добавить меня в группу, где вы являетесь администратором.');
        _bot.sendMessage(msg.chat.id, 'Выберите группу для настройки', {
            reply_markup: {
                inline_keyboard: formatGroupsListReplyButtons(list)
            }
        });
    });
};

function onGroupAnswer(msg) {
    //TO DO: show group config
};

function onAddToChat(msg) {
    if (msg.group_chat_created || (msg.new_chat_participant && msg.new_chat_participant.id == _bot.me.id)) {
        getAndSaveChatAdmins(msg);
    };
    Utils.sendHelpForGroup(_bot, msg);
};

function onRemoveFromChat(msg) {
    if (msg.left_chat_participant && msg.left_chat_participant.id == _bot.me.id) {
        removeChatAdmins(msg);
    };
};

function getAndSaveChatAdmins(msg) {
    return _bot._request('getChatAdministrators', { form: { chat_id: msg.chat.id } }).then(res => {
        return Promise.all(res.map(row => {
            return saveChatInfo({
                adminId: row.user.id,
                chatId: msg.chat.id,
                chatTitle: msg.chat.title
            });
        }));
    });
};

function removeChatAdmins(msg) {
    return Chat.remove({ chatId: msg.chat.id }).exec();
};


function saveChatInfo(info) {
    return Chat.findOneAndUpdate({ adminId: info.adminId, chatId: info.chatId }, info, { upsert: true });
};

function formatGroupsListReplyButtons(groups) {
    return groups.map((g, i) => {
        return [
            {
                text: g.chatTitle,
                callback_data: g._id.toString()
            }
        ]
    });
};