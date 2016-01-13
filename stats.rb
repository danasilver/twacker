require 'twitter'
require 'mongo'

twitter = Twitter::REST::Client.new do |config|
  config.consumer_key = ENV['TWITTER_CONSUMER_KEY']
  config.consumer_secret = ENV['TWITTER_CONSUMER_SECRET']
end

mongo_uri = ENV['MONGOLAB_URI'] || 'mongodb://127.0.0.1:27017/twacker'
mongo = Mongo::Client.new(mongo_uri)

username = ENV['TWITTER_USERNAME']

follower_ids = twitter.follower_ids(username)
friend_ids = twitter.friend_ids(username)

if mongo[:twacker_stats].find({'date' => Date.today}).count == 0
  mongo[:twacker_stats].insert_one(
    date: Date.today,
    followers: follower_ids.to_a,
    friends: friend_ids.to_a
  )
end

today = mongo[:twacker_stats].find({'date' => Date.today}).first
yesterday = mongo[:twacker_stats].find({'date' => Date.today - 1}).first

# No previous day to compare to on the first day this is run.
exit 0 unless yesterday

needs_profile = Array.new
needs_profile.concat(today[:followers] - yesterday[:followers])
needs_profile.concat(today[:friends] - yesterday[:friends])
needs_profile.concat(yesterday[:followers] - today[:followers])
needs_profile.concat(yesterday[:friends] - today[:friends])

needs_profile.uniq.each do |user_id|
  user = twitter.user(user_id)

  next if mongo[:profiles].find({'user_id' => user_id}).count > 0

  mongo[:profiles].insert_one(
    user_id: user.id,
    name: user.name,
    screen_name: user.screen_name,
    url: user.url.to_s,
    profile_image_url: user.profile_image_url.to_s
  )
end
