class Car < ActiveRecord::Base
  self.table_name = 'Cars'
  has_many :car_stops
end