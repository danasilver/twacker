## Twacker

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Track your Twitter friends and followers.

### Deploy

#### Create a Twitter App

Create a [Twitter App](https://apps.twitter.com/) to get a consumer key and
secret. The **Callback URL** setting isn't important since the app doesn't
log in with Twitter.

#### Deploy to Heroku

Use the Heroku Button to deploy.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Set the App Name and environment variables.

* `TWITTER_CONSUMER_KEY` The consumer key from your Twitter App.
* `TWITTER_CONSUMER_SECRET` The consumer secret from your Twitter App.
* `TWITTER_USERNAME` The Twitter username to track.

#### Set Heroku Scheduler

After deploying to Heroku add the **stats.rb** task to
[Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler#scheduling-jobs).

You'll want to run the following task **daily** at the end of the day.

```
ruby stats.rb
```
