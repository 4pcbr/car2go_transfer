module Db

  class Connector
    
    MYSQL_USER = ENV["C2G_MYSQL_USER"] or abort("C2G_MYSQL_USER env variable is expected")
    MYSQL_PWD  = ENV["C2G_MYSQL_PWD"]  or abort("C2G_MYSQL_PWD env variable is expected")
    MYSQL_HOST            = 'localhost'
    MYSQL_DB              = 'car2go'
    MYSQL_READ_TIMEOUT    = 5
    MYSQL_CONNECT_TIMEOUT = 60
    
    class << self

      def connect!
        
        ActiveRecord::Base.establish_connection(
          adapter:          'mysql2',
          host:             MYSQL_HOST,
          database:         MYSQL_DB,
          username:         MYSQL_USER,
          password:         MYSQL_PWD,
          uncoding:         'utf8',
          read_timeout:     MYSQL_READ_TIMEOUT,
          reconnect:        true,
        )
        
      end

    end
  end

end