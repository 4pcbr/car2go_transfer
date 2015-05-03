class CarStop < ActiveRecord::Base
  self.table_name = 'CarStops'
  belongs_to :car

  def timestamp
    created_at.to_i
  end

  def interior_int
    interior == "GOOD" ? 1 : 0
  end

  def exterior_int
    exterior == "GOOD" ? 1 : 0
  end

end
