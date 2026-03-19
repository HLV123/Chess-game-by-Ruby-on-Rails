require "rails/all"

# Require the gems listed in Gemfile
Bundler.require(*Rails.groups)

require_relative "application"

Rails.application.initialize!
