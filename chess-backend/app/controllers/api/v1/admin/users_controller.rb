module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        before_action :authenticate_admin!
        before_action :find_user, only: [:show, :update, :destroy]

        # GET /api/v1/admin/users
        def index
          page = (params[:page] || 1).to_i
          per_page = (params[:per_page] || 50).to_i
          users = User.order(created_at: :desc).offset((page - 1) * per_page).limit(per_page)
          render json: { users: users.map(&:as_public_json), total: User.count }, status: :ok
        end

        # GET /api/v1/admin/users/:id
        def show
          render json: { user: @user.as_public_json }, status: :ok
        end

        # POST /api/v1/admin/users
        def create
          user = User.new(user_create_params)
          user.role = "player"
          if user.save
            render json: { message: "User created", user: user.as_public_json }, status: :created
          else
            render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        end

        # PUT /api/v1/admin/users/:id
        def update
          if @user.admin?
            render json: { error: "Cannot edit admin account" }, status: :forbidden
            return
          end

          attrs = user_update_params.to_h
          attrs.delete(:password) if attrs[:password].blank?

          if @user.update(attrs)
            render json: { message: "User updated", user: @user.reload.as_public_json }, status: :ok
          else
            render json: { error: @user.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/admin/users/:id
        def destroy
          if @user.admin?
            render json: { error: "Cannot delete admin account" }, status: :forbidden
            return
          end

          @user.destroy
          render json: { message: "User deleted" }, status: :ok
        end

        private

        def find_user
          @user = User.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "User not found" }, status: :not_found
        end

        def user_create_params
          params.require(:user).permit(:username, :email, :password, :rating)
        end

        def user_update_params
          params.require(:user).permit(:username, :email, :password, :rating)
        end
      end
    end
  end
end
