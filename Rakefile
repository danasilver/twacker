task :set_env_heroku do
  File.open('.env', 'r').each_line do |variable|
    `heroku config:set #{variable.gsub("\n", '')}`
  end
end
