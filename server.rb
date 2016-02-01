require 'sinatra'
require 'mongo'
require 'json/ext'
require 'date'

mongo_uri = ENV['MONGOLAB_URI'] || 'mongodb://127.0.0.1:27017/twacker'

configure do
  db = Mongo::Client.new(mongo_uri)
  set :mongo_db, db
  set :public_folder, File.dirname(__FILE__) + '/static'
end

get '/' do
  @username = ENV['TWITTER_USERNAME']
  erb :index
end

get '/stats' do
  aggregated = Array.new
  days = settings.mongo_db[:twacker_stats].find({'date' => {'$gt' => Date::today - 30}})

  days.each_with_index do |today, i|
    yesterday = days.to_a[i - 1] unless i == 0

    aggregated << {
      date: today[:date].strftime('%Y-%m-%d'),
      followers_count:   today[:followers].length,
      friends_count:     today[:friends].length,
      followers_added:   profiles(yesterday ? today[:followers] - yesterday[:followers] : []),
      followers_removed: profiles(yesterday ? yesterday[:followers] - today[:followers] : []),
      friends_added:     profiles(yesterday ? today[:friends] - yesterday[:friends] : []),
      friends_removed:   profiles(yesterday ? yesterday[:friends] - today[:friends] : [])
    }
  end

  content_type :json
  aggregated.to_json
end

def profiles(ids)
  return [] if ids.empty?

  settings.mongo_db[:profiles].find(
    {:$or => ids.map {|id| {'user_id' => id}}}
  ).projection({'_id' => false}).to_a
end
