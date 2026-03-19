class JwtService
  class DecodeError < StandardError; end
  class ExpiredToken < StandardError; end

  SECRET_KEY = if Rails.env.production?
    ENV.fetch("JWT_SECRET_KEY") 
  else
    ENV.fetch("JWT_SECRET_KEY", "royal_chess_dev_secret_key_#{Rails.env}")
  end

  ALGORITHM = "HS256"
  EXPIRY    = 7.days

  def self.encode(payload, expiry = EXPIRY)
    payload = payload.dup
    payload[:exp] = expiry.from_now.to_i
    payload[:iat] = Time.current.to_i
    JWT.encode(payload, SECRET_KEY, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: ALGORITHM })
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::ExpiredSignature
    raise ExpiredToken, "Token has expired"
  rescue JWT::DecodeError => e
    raise DecodeError, "Invalid token: #{e.message}"
  end

  def self.token_for_user(user)
    encode({ user_id: user.id, role: user.role })
  end
end
