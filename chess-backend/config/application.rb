require_relative "boot"
require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "rails/test_unit/railtie"
Bundler.require(*Rails.groups)
module ChessBackend
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.autoload_paths += %W[#{config.root}/app/services]
    config.eager_load_paths += %W[#{config.root}/app/services]
    config.time_zone = "UTC"
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "*"
        resource "*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose: ["Authorization"]
      end
    end
    config.generators do |g|
      g.test_framework :rspec
      g.fixture_replacement :factory_bot, dir: "spec/factories"
    end
  end
end