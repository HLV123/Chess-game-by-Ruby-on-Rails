class ApplicationController < ActionController::API
  private

  def authenticate_user!
    token = extract_token
    unless token
      render json: { error: "Authorization token required" }, status: :unauthorized
      return
    end

    begin
      payload = ::JwtService.decode(token)
      @current_user = User.find(payload[:user_id])
    rescue ::JwtService::ExpiredToken
      render json: { error: "Token has expired" }, status: :unauthorized
    rescue ::JwtService::DecodeError
      render json: { error: "Invalid token" }, status: :unauthorized
    rescue ActiveRecord::RecordNotFound
      render json: { error: "User not found" }, status: :unauthorized
    end
  end

  def authenticate_admin!
    authenticate_user!
    return if performed?
    unless @current_user&.admin?
      render json: { error: "Admin access required" }, status: :forbidden
    end
  end

  def current_user
    @current_user
  end

  def extract_token
    header = request.headers["Authorization"]
    return nil unless header
    header.split(" ").last
  end
end
