-- Supabase Schema for the Entire Application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'player', -- 'operator' or 'player'
    country VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER,
    operator_id UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game rounds table
CREATE TABLE IF NOT EXISTS game_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, round_number)
);

-- Production table
CREATE TABLE IF NOT EXISTS production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    country VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, country, product)
);

-- Demand table
CREATE TABLE IF NOT EXISTS demand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    country VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, country, product)
);

-- Tariff rates table
CREATE TABLE IF NOT EXISTS tariff_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    product VARCHAR(255) NOT NULL,
    from_country VARCHAR(255) NOT NULL,
    to_country VARCHAR(255) NOT NULL,
    rate DECIMAL(5,2) NOT NULL, -- Rate as a percentage (0-100)
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, round_number, product, from_country, to_country)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    sender_country VARCHAR(255),
    sender_username VARCHAR(255),
    message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'system'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_operator_id ON games(operator_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_round_number ON game_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_production_game_id ON production(game_id);
CREATE INDEX IF NOT EXISTS idx_production_country ON production(country);
CREATE INDEX IF NOT EXISTS idx_production_product ON production(product);
CREATE INDEX IF NOT EXISTS idx_demand_game_id ON demand(game_id);
CREATE INDEX IF NOT EXISTS idx_demand_country ON demand(country);
CREATE INDEX IF NOT EXISTS idx_demand_product ON demand(product);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_game_id ON tariff_rates(game_id);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_round_number ON tariff_rates(round_number);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_product ON tariff_rates(product);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_from_country ON tariff_rates(from_country);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_to_country ON tariff_rates(to_country);
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Row Level Security (RLS) policies
-- Note: You may need to adjust these policies based on your specific security requirements

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariff_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (you may need to adjust these based on your requirements)
-- Users can read their own data
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can read games they're part of (you might need a join table for this)
CREATE POLICY "Users can read games" ON games
    FOR SELECT USING (true);

-- Users can read game rounds for games they're part of
CREATE POLICY "Users can read game rounds" ON game_rounds
    FOR SELECT USING (true);

-- Users can read production data for games they're part of
CREATE POLICY "Users can read production data" ON production
    FOR SELECT USING (true);

-- Users can read demand data for games they're part of
CREATE POLICY "Users can read demand data" ON demand
    FOR SELECT USING (true);

-- Users can read tariff rates for games they're part of
CREATE POLICY "Users can read tariff rates" ON tariff_rates
    FOR SELECT USING (true);

-- Users can read chat messages for games they're part of
CREATE POLICY "Users can read chat messages" ON chat_messages
    FOR SELECT USING (true);

-- Users can insert chat messages
CREATE POLICY "Users can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Users can insert tariff rates for their country
CREATE POLICY "Users can insert tariff rates for their country" ON tariff_rates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND country = from_country
        )
    );

-- Users can update tariff rates they submitted
CREATE POLICY "Users can update their tariff rates" ON tariff_rates
    FOR UPDATE USING (
        submitted_by = auth.uid()
    );

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_rounds_updated_at BEFORE UPDATE ON game_rounds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_updated_at BEFORE UPDATE ON production
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_updated_at BEFORE UPDATE ON demand
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tariff_rates_updated_at BEFORE UPDATE ON tariff_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();