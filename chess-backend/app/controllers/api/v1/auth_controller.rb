module Api
  module V1
    class AuthController < ApplicationController
      before_action :authenticate_user!, only: [:me]

      def register
        user = User.new(register_params)
        if user.save
          DailyStat.record_new_user
          token = ::JwtService.token_for_user(user)
          render json: { message: "Account created successfully", token: token, user: user.as_public_json }, status: :created
        else
          render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by("LOWER(username) = ?", params[:username]&.downcase)
        if user&.authenticate(params[:password])
          user.touch(:updated_at)
          DailyStat.record_active_user
          token = ::JwtService.token_for_user(user)
          render json: { message: "Login successful", token: token, user: user.as_public_json }, status: :ok
        else
          render json: { error: "Invalid username or password" }, status: :unauthorized
        end
      end

      def me
        render json: { user: current_user.as_public_json }, status: :ok
      end

      private

      def register_params
        params.permit(:username, :email, :password)
      end
    end
  end
end
