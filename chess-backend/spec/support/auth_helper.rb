module AuthHelper
  def auth_headers(user)
    token = JwtService.token_for_user(user)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :controller
  config.include AuthHelper, type: :request
end
