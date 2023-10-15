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

As page loads fetch all the chats & render

If a message is sent

Message should be sent to

User should get option to set name at the dashboard

Send only required information about user & chat in the response

Load all chats recieved from the backend

Render all contacts box in the contacts section

Loop the array & add into markup & insert HTML on the contacts list section

SRP
DRY
Pure Functions
YAGNI
KISS
