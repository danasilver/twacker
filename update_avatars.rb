require 'net/http'
require 'twitter'
require 'mongo'

twitter = Twitter::REST::Client.new do |config|
  config.consumer_key = ENV['TWITTER_CONSUMER_KEY']
  config.consumer_secret = ENV['TWITTER_CONSUMER_SECRET']
end

mongo_uri = ENV['MONGOLAB_URI'] || 'mongodb://127.0.0.1:27017/twacker'
mongo = Mongo::Client.new(mongo_uri)

mongo[:profiles].find().to_a.each do |profile|
  res = Net::HTTP.get_response(URI(profile[:profile_image_url]))

  next if res.is_a?(Net::HTTPSuccess)

  begin
    user = twitter.user(profile[:user_id])
    p "Updating #{profile[:screen_name]}'s avatar to #{user.profile_image_url.to_s}"
    mongo[:profiles].update_one(
      {'user_id' =>  profile[:user_id]},
      {'$set' => {'profile_image_url' => user.profile_image_url.to_s}})
  rescue Twitter::Error => e
    p "Cannot update '#{profile[:screen_name]}'. #{e}"
  end
end
