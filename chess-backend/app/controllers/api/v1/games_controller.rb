module Api
  module V1
    class GamesController < ApplicationController
      before_action :authenticate_user!

      def index
        games = current_user.games.order(created_at: :desc).limit(params[:limit] || 50)
        render json: { games: games.map(&:as_public_json), total: current_user.games.count }, status: :ok
      end

      def show
        game = current_user.games.find(params[:id])
        render json: { game: game.as_public_json }, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Game not found" }, status: :not_found
      end

      def create
        game = current_user.games.build(game_params)
        if game.save
          render json: { message: "Game saved", game: game.as_public_json, user: current_user.reload.as_public_json }, status: :created
        else
          render json: { error: game.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end
      end

      private

      def game_params
        params.require(:game).permit(:mode, :difficulty, :player_color, :winner, :result, :moves, :total_moves, :duration_seconds)
      end
    end
  end
end
