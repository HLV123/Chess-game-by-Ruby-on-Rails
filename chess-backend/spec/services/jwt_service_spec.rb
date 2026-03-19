require "rails_helper"

RSpec.describe JwtService do
  let(:user) { create(:user) }

  describe ".encode / .decode" do
    it "encodes and decodes a payload" do
      token = described_class.encode({ user_id: user.id })
      decoded = described_class.decode(token)
      expect(decoded[:user_id]).to eq(user.id)
    end

    it "includes expiry" do
      token = described_class.encode({ user_id: user.id })
      decoded = described_class.decode(token)
      expect(decoded[:exp]).to be_present
    end
  end

  describe ".token_for_user" do
    it "creates token with user_id and role" do
      token = described_class.token_for_user(user)
      decoded = described_class.decode(token)
      expect(decoded[:user_id]).to eq(user.id)
      expect(decoded[:role]).to eq(user.role)
    end
  end

  describe "error handling" do
    it "raises DecodeError for invalid token" do
      expect { described_class.decode("garbage") }.to raise_error(JwtService::DecodeError)
    end

    it "raises ExpiredToken for expired token" do
      token = described_class.encode({ user_id: user.id }, -1.hour)
      expect { described_class.decode(token) }.to raise_error(JwtService::ExpiredToken)
    end
  end
end
