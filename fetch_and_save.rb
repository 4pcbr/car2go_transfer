#!/usr/bin/env ruby

$:.unshift File.expand_path(File.dirname(__FILE__), 'lib')

require 'rubygems'
require 'active_record'
require 'eventmachine'
require 'em-http-request'
require 'mysql2'
require 'mysql2/em'
require 'json'

# local lib files
require 'car'
require 'car_stop'

MYSQL_HOST = 'localhost'
MYSQL_DB   = 'car2go'
MYSQL_USER = ENV["C2G_MYSQL_USER"] or abort("C2G_MYSQL_USER env variable is expected")
MYSQL_PWD  = ENV["C2G_MYSQL_PWD"]  or abort("C2G_MYSQL_PWD env variable is expected")
MYSQL_READ_TIMEOUT = 5
MYSQL_CONNECT_TIMEOUT = 60

log = Logger.new(STDOUT)
log.level = Logger::DEBUG

ActiveRecord::Base.logger = log

CAR2GO_API_VEHICLES_URL = 'https://www.car2go.com/api/v2.1/vehicles?loc=amsterdam&oauth_consumer_key=car2gowebsite&format=json'

RESPONSE_TO_MODEL_ATTR_MAP = {
  car: {
    'vin'         => 'vin',
    'name'        => 'name',
    'engineType'  => 'engine_type',
  },
  car_stop: {
    'address'     => 'address',
    'charging'    => 'charging',
    'coordinates' => Proc.new { |v| { 'lat' => v[0], 'lon' => v[1], 'z' => v[2] } },
    'interior'    => 'interior',
    'exterior'    => 'exterior',
    'fuel'        => 'fuel',
  },
}

def parse(resp, parser)
  out = {}
  parser.each_pair do |resp_attr, out_attr|
    v = resp[resp_attr]
    if (out_attr.is_a? Proc)
      out = out.merge(out_attr.call(v))
    else
      out[out_attr] = v
    end
  end
  out
end

def process_and_save(json_data)
  placemarks = json_data['placemarks'] or return nil
  placemarks.each do |json_obj|
    car_data = parse(json_obj, RESPONSE_TO_MODEL_ATTR_MAP[:car])
    car = Car.find_or_create_by(car_data)
    car_stop = CarStop.new parse(json_obj, RESPONSE_TO_MODEL_ATTR_MAP[:car_stop])
    car_stop.car = car
    begin
      car_stop.save
    rescue ActiveRecord::RecordNotUnique => e
      # ignore
    end
  end
end

log.info 'Establishing a DB connection'

ActiveRecord::Base.establish_connection(
  adapter:          'mysql2',
  host:             MYSQL_HOST,
  database:         MYSQL_DB,
  username:         MYSQL_USER,
  password:         MYSQL_PWD,
  uncoding:         'utf8',
  read_timeout:     MYSQL_READ_TIMEOUT,
  # connect_timeout:  MYSQL_CONNECT_TIMEOUT,
  reconnect:        true,
)

log.info 'DB connection established'

EM.run do
  
  http_connect_opts = {
    connect_timeout:    10,
    inactivity_timeout: 20,
  }
  
  EM.add_periodic_timer(1 * 60) do
    begin
      http_req = EM::HttpRequest.new(CAR2GO_API_VEHICLES_URL, http_connect_opts).get
      http_req.errback do
        log.error 'Error fetching the URL'
      end
      http_req.callback do
        begin
          res = JSON.parse(http_req.response)
          process_and_save(res)
        rescue Exception => e
          log.error 'Exception raised: ' + e.to_s
        end
      end
    rescue Exception => e
      log.error e.to_s
    end
  end
end