module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        before_action :authenticate_admin!

        def stats
          render json: {
            stats: summary_stats,
            users: all_users_data,
            recent_games: recent_games_data,
            daily_stats: daily_stats_data,
            game_mode_distribution: game_mode_distribution,
            rating_distribution: rating_distribution,
            top_players: top_players_data,
            activity_heatmap: activity_heatmap,
            weekly_games: weekly_games_data
          }, status: :ok
        end

        def games
          scope = Game.includes(:user).order(created_at: :desc)
          scope = scope.where(mode: params[:mode]) if params[:mode].present?
          page = (params[:page] || 1).to_i
          per_page = (params[:per_page] || 50).to_i
          games = scope.offset((page - 1) * per_page).limit(per_page)
          render json: {
            games: games.map { |g| g.as_public_json.merge(username: g.user&.username || "deleted") },
            total: scope.count
          }, status: :ok
        end

        def daily_stats
          days = (params[:days] || 14).to_i
          render json: { daily_stats: daily_stats_data(days) }, status: :ok
        end

        def overview
          render json: { summary: summary_stats, top_players: top_players_data }, status: :ok
        end

        private

        def summary_stats
          week_start = 7.days.ago.beginning_of_day
          prev_week_start = 14.days.ago.beginning_of_day

          games_this_week = Game.where("created_at >= ?", week_start).count
          games_prev_week = Game.where(created_at: prev_week_start..week_start).count
          games_change = games_prev_week > 0 ? (((games_this_week - games_prev_week).to_f / games_prev_week) * 100).round(1) : 0

          users_this_week = User.where("created_at >= ?", week_start).count
          users_prev_week = User.where(created_at: prev_week_start..week_start).count
          users_change = users_prev_week > 0 ? (((users_this_week - users_prev_week).to_f / users_prev_week) * 100).round(1) : 0

          active_today = User.active_since(Time.current.beginning_of_day).count
          active_yesterday = User.where(updated_at: 1.day.ago.beginning_of_day..1.day.ago.end_of_day).count
          active_change = active_yesterday > 0 ? (((active_today - active_yesterday).to_f / active_yesterday) * 100).round(1) : 0

          avg_rating = User.players.average(:rating)&.round(0) || 1200

          {
            totalUsers: User.players.count,
            totalGames: Game.count,
            activeToday: active_today,
            avgRating: avg_rating,
            gamesChange: games_change,
            usersChange: users_change,
            activeChange: active_change
          }
        end

        def all_users_data
          User.order(rating: :desc).limit(50).map(&:as_public_json)
        end

        def recent_games_data
          Game.includes(:user).recent.limit(20).map { |g|
            g.as_public_json.merge(username: g.user&.username || "deleted")
          }
        end

        def daily_stats_data(days = 14)
          DailyStat.last_days(days).map do |s|
            {
              date: s.date, newUsers: s.new_users, gamesPlayed: s.games_played,
              pvpGames: s.pvp_games, aiGames: s.ai_games,
              avgGameLength: s.avg_game_length, activeUsers: s.active_users
            }
          end
        end

        def game_mode_distribution
          total = Game.count.to_f
          return [] if total.zero?

          counts = Game.group(:mode, :difficulty).count
          pvp   = counts.select { |k, _| k[0] == "pvp" }.values.sum
          easy  = counts[["ai", "easy"]]   || 0
          med   = counts[["ai", "medium"]] || 0
          hard  = counts[["ai", "hard"]]   || 0

          [
            { label: "PvP",       value: pvp,  pct: ((pvp  / total) * 100).round(1), color: "#06b6d4" },
            { label: "AI Easy",   value: easy, pct: ((easy / total) * 100).round(1), color: "#22c55e" },
            { label: "AI Medium", value: med,  pct: ((med  / total) * 100).round(1), color: "#8b5cf6" },
            { label: "AI Hard",   value: hard, pct: ((hard / total) * 100).round(1), color: "#ef4444" }
          ]
        end

        def rating_distribution
          total = User.players.count.to_f
          return [] if total.zero?

          ranges = [
            { range: "800-1000",  min: 800,  max: 1000, color: "#22c55e" },
            { range: "1000-1200", min: 1000, max: 1200, color: "#06b6d4" },
            { range: "1200-1400", min: 1200, max: 1400, color: "#6366f1" },
            { range: "1400-1600", min: 1400, max: 1600, color: "#8b5cf6" },
            { range: "1600+",     min: 1600, max: 9999, color: "#ef4444" }
          ]

    
          rating_counts = User.players.group(
            Arel.sql("CASE
              WHEN rating >= 800  AND rating < 1000 THEN '800-1000'
              WHEN rating >= 1000 AND rating < 1200 THEN '1000-1200'
              WHEN rating >= 1200 AND rating < 1400 THEN '1200-1400'
              WHEN rating >= 1400 AND rating < 1600 THEN '1400-1600'
              WHEN rating >= 1600 THEN '1600+'
              ELSE 'other' END")
          ).count

          ranges.map do |r|
            count = rating_counts[r[:range]] || 0
            r.merge(count: count, pct: ((count / total) * 100).round(1))
          end
        end

        def top_players_data
          User.players.by_rating.limit(10).map { |u|
            { id: u.id, username: u.username, rating: u.rating, wins: u.wins,
              losses: u.losses, win_rate: u.win_rate, games_played: u.games_played }
          }
        end

    
        def activity_heatmap
          start_date = 27.days.ago.to_date
          end_date = Date.current

          daily_counts = Game.where(created_at: start_date.beginning_of_day..end_date.end_of_day)
                             .group("DATE(created_at)")
                             .count

          (start_date..end_date).map do |date|
            count = daily_counts[date] || 0
            level = case count
                    when 0     then 0
                    when 1..3  then 1
                    when 4..8  then 2
                    when 9..15 then 3
                    else 4
                    end
            { date: date, count: count, level: level }
          end
        end

        def weekly_games_data
          start_of_week = 6.days.ago.to_date
          daily = Game.where("created_at >= ?", start_of_week.beginning_of_day)
                      .group("DATE(created_at)")
                      .count

          ai_daily = Game.ai_games.where("created_at >= ?", start_of_week.beginning_of_day)
                         .group("DATE(created_at)")
                         .count

          days = %w[Mon Tue Wed Thu Fri Sat Sun]
          (start_of_week..Date.current).map do |date|
            {
              day: days[date.wday == 0 ? 6 : date.wday - 1],
              date: date,
              total: daily[date] || 0,
              ai: ai_daily[date] || 0
            }
          end
        end
      end
    end
  end
end
