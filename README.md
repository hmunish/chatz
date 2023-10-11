# chatz

As a user I want to create a new chat & store it in database

Create chat

chat:{

    users:[userId, userId],

    messages:{
        type: [{userName: 'Munish', message: 'Hey', createdAt: '2023-22-01'}, {userName: 'Munish', message: 'Hey', createdAt: '2023-22-01'}, ]
    }

}


As a user I want to create a new chat & store it in both users field


Create chat
Store chat id in both users


As I create a chat

New chat should be created if no chat is already created with the same users

If user doesn't exist in the friendsList -> 

then a new chat Id will be created 

& new chat id will be inserted in both the users document


As page loads

request is made to fetch all the chats of the current user
    chats: [{user: [], messages: [{}]}]

after all the chats is recieved all the chats is rendered on the dashboard

