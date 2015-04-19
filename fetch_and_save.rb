#!/usr/bin/env ruby

require 'rubygems'
require 'active_record'
require 'eventmachine'
require 'mysql2'
require 'mysql2/em'

MYSQL_HOST = 'localhost'
MYSQL_DB   = 'car2go'
MYSQL_USER = ENV["C2G_MYSQL_USER"] or abort("C2G_MYSQL_USER env variable is expected")
MYSQL_PWD  = ENV["C2G_MYSQL_PWD"]  or abort("C2G_MYSQL_PWD env variable is expected")
MYSQL_READ_TIMEOUT = 5
MYSQL_CONNECT_TIMEOUT = 60

log = Logger.new(STDOUT)
log.level = Logger::DEBUG

ActiveRecord::Base.logger = log

EM.run do
  
  log.info 'Establishing a DB connection'
  
  mysql_client = Mysql2::EM::Client.new(
    host:             MYSQL_HOST,
    database:         MYSQL_DB,
    username:         MYSQL_USER,
    password:         MYSQL_PWD,
    uncoding:         'utf8',
    read_timeout:     MYSQL_READ_TIMEOUT,
    connect_timeout:  MYSQL_CONNECT_TIMEOUT,
    reconnect:        true,
  )
  
  log.info 'DB connection established'

  EM.stop
  
end