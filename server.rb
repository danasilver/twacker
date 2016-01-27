require 'sinatra'
require 'sinatra/param'
require 'mongo'
require 'json/ext'
require 'date'

mongo_uri = ENV['MONGOLAB_URI'] || 'mongodb://127.0.0.1:27017/twacker'

configure do
  db = Mongo::Client.new(mongo_uri)
  set :mongo_db, db

  helpers Sinatra::Param
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
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
      followers_added:   yesterday ? today[:followers] - yesterday[:followers] : [],
      followers_removed: yesterday ? yesterday[:followers] - today[:followers] : [],
      friends_added:     yesterday ? today[:friends] - yesterday[:friends] : [],
      friends_removed:   yesterday ? yesterday[:friends] - today[:friends] : []
    }
  end

  content_type :json
  aggregated.to_json
end

get '/profile' do
  param :user_id, Integer, required: true

  content_type :json
  profile = settings.mongo_db[:profiles].find(
    {'user_id' => params[:user_id]}
  ).projection({'_id' => false}).first.to_json
end
