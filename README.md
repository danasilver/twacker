## Twacker

Track your Twitter friends and followers.

### Deploy

#### Create a Twitter App

Create a [Twitter App](https://apps.twitter.com/) to get a consumer key and
secret. The **Callback URL** setting isn't important since the app doesn't
log in with Twitter.

#### Deploy to Heroku

Deploy to Heroku using the Heroku Button:


#### Set the environment variables

Using the Heroku Toolbelt CLI or your app's settings page, set the following
config variables:

```
TWITTER_CONSUMER_KEY=consumer_key_from_app
TWITTER_CONSUMER_SECRET=consumer_secret_from_app
TWITTER_USERNAME=username_to_track
```

If you place these in a file called **.env** you can `gem install rake` and
use `rake set_env_heroku` to set the environment automatically.

#### Set Heroku Scheduler

After deploying to Heroku add the **stats.rb** task to
[Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler#scheduling-jobs).

You'll want to run the following task **daily**.

```
ruby stats.rb
```
