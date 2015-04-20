class CarStop < ActiveRecord::Base
  self.table_name = 'CarStops'
  belongs_to :car
end