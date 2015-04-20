$:.unshift File.expand_path('lib', File.dirname(__FILE__))

require 'rubygems'
require 'sinatra'
require 'active_record'
require 'mysql2'
require 'json'
require 'zlib'

require 'model/car'
require 'model/car_stop'
require 'db/connector'

Db::Connector.connect!

get '/' do
  erb :index
end

def gzipped(&blk)
  headers['Content-Encoding'] = 'gzip'
    StringIO.new.tap do |io|
    gz = Zlib::GzipWriter.new(io)
    begin
      gz.write(blk.call)
    ensure
      gz.close
    end
  end.string
end

get '/api/cars' do
  cars = Car.all
  content_type :json
  gzipped do
    cars.to_json
  end
end

get '/api/car_stops' do
  car_stops = CarStop.order(:created_at).all
  content_type :json
  gzipped do
    car_stops.to_json
  end
end