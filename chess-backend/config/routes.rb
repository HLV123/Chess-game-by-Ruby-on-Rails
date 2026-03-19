Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Authentication
      post "auth/register", to: "auth#register"
      post "auth/login",    to: "auth#login"
      get  "auth/me",       to: "auth#me"
      # Games
      resources :games, only: [:index, :show, :create]
      # Admin
      namespace :admin do
        get "stats",    to: "dashboard#stats"
        get "games",    to: "dashboard#games"
        get "daily",    to: "dashboard#daily_stats"
        get "overview", to: "dashboard#overview"
        resources :users, only: [:index, :show, :create, :update, :destroy]
      end
    end
  end
  # Health check
  get "up", to: proc { [200, {}, ["OK"]] }

  # SPA fallback — route không match API sẽ trả về index.html
  get '*path', to: proc { [200, { 'Content-Type' => 'text/html' }, [File.read(Rails.root.join('public/index.html'))]] },
    constraints: ->(req) { !req.path.start_with?('/api') && !req.path.start_with?('/up') }
end