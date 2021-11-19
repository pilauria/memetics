# MEMETICS

## Description

Meme Generator webapp to discover amazing meme and create your own collections and share it with friends.

The users are also able to rate and comment their meme collections!
​

## User stories (MVP)

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault
  ​
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
  ​
- **Homepage** - As a user I want to be able to access the homepage so that I can search or browse among the most featured memes
  ​
- **Sign up** - As a user I want to sign up on the webpage so that I can use the premium features.
  ​
- **Log in** - As a user I want to be able to log in on the webpage so that I can add the memes to my favorites, listen to them and leave a rating.
  ​
- **Log out** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account
  ​
- **Profile** - As a user I want to be able to see my profile and edit it
  ​

## Routes

| Name         | Method | Endpoint                            | Description                   | Body                  | Redirects                |
| ------------ | ------ | ----------------------------------- | ----------------------------- | --------------------- | ------------------------ |
| Home         | GET    | /                                   | See the main page             |                       |                          |
| Log in form  | GET    | /login                              | See the form to log in        |                       |                          |
| Log in       | POST   | /login                              | Log in the user               | {mail, password}      | /                        |
| Sign Up form | GET    | /signup                             | See the form to sign up       |                       |                          |
| Sign Up      | POST   | /signup                             | Sign up a user                | {mail, password}      | /profile                 |
| Profile      | GET    | /profile                            | See the user profile          | {mail, username}      |                          |
| Profile      | POST   | /profile/edit                       | Update the user profile       | {mail, username}      | /profile                 |
| MEME Card    | GET    | /meme/{memeID}                      | See the meme information      | {memeId, memeInfo...} |                          |
| MEME Card    | POST   | /meme/{memeID}/favorited            | Add a meme to users favorites | {memeId, memeInfo...} | /login or /meme/{memeID} |
| MEME Card    | POST   | /meme/{memeID}/rating               | Add a rating to a meme        | {memeId, rating}      | /login or /meme/{memeID} |
| Favorites    | GET    | /{userId}/favorites                 | See my favorited memes        | {memeId}              |                          |
| Favorites    | GET    | /{userId}/favorites/{memeId}/delete | Delet a favorited meme        | {memeId}              | /favorites               |

## Models

### User

```js
{
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email:{
      type: String,
      required: [ true, 'Email is required,']
      unique: [ true, 'This email has already been registered.']
    },
    profilePicture: {
        Type: String,
        default: [look for an avatar]
    },
    hashedPassword: {
      type: String,
      required: [ true, 'Password is required,']
    },
    { timestamp: true}
}
```

### Favorited meme

```js
{
  image: String,
  text: String,
  meme: { Object } /* Object with the meme episodes */,
  thumbnail: String,
  pub_date_ms: Date,
  // guid_from_rss:"004f03c8-cdf9-4ff5-9d89-b2147f8d55cf" /* ? */,
  title_original: String,
  // audio_length_sec: Number,
  // explicit_content: Bolean,
  description_original: String,
  transcripts_highlighted:[ String ],
  usersIDs: {
      type: [mongoose.SchemaTypes.ObjectId]
  },
  rating: [ Numbers ],
  comments: [ mongoose.SchemaTypes.ObjectId ],
  { timestamp: true }
}
```

### Comments

```js
{
  content: String,
  author: mongoose.SchemaTypes.ObjectId,
  { timestamp: true }
},
```

​ ​

## Backlog / Nice to have

- **Search bar** - As a user can search and find the best meme/image with serch bar.
  ​
- **Leave Comments** - As a user I want to be able to comment on the memes and leave my review.
  ​
- **Social Media Login** - As a user I want to be able to login with my social media accounts.
  ​
- **Custom Collections** - As a user I want to be able to create my customized collections of meme.

- **Social Net** - As a user I want to be add friends in app.

## Links

### Git

The url to your repository and to your deployed project

[Repository Link]()

[Deploy Link]()

<br>

### Slides

The url to your presentation slides

[Slides Link](https://docs.google.com/presentation/d/1DTV1ltW6sISUnf0aVgHEbrv5aA2Kw5qSiga7iaCoC8E/edit)

### Contributors

FirstName LastName - [`<github-username>`](https://github.com/person1-username) - [`<linkedin-profile-link>`](https://www.linkedin.com/in/person1-username)

FirstName LastName - [`<github-username>`](https://github.com/person2-username) - [`<linkedin-profile-link>`](https://www.linkedin.com/in/person2-username)
