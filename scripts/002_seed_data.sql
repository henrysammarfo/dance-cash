-- Seed Studios
INSERT INTO studios (id, name, description, location, wallet_address)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Neon Moves Studio', 'The premier spot for urban dance styles.', 'New York, NY', 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a'),
  ('11111111-1111-1111-1111-111111111111', 'Rhythm & Flow', 'Contemporary and Jazz fusion classes.', 'Los Angeles, CA', 'bitcoincash:qz7j7d5682374658236458236458236458236458');

-- Seed Events
INSERT INTO events (studio_id, title, description, date, location, price_bch, price_fiat, max_spots, image_url)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Urban Night Workshop', 'Learn the latest moves in this intensive workshop.', NOW() + INTERVAL '2 days', 'Neon Moves Studio, NY', 0.05, 25.00, 30, '/placeholder.svg?height=400&width=600'),
  ('00000000-0000-0000-0000-000000000000', 'Hip Hop Beginners', 'Start your journey with the basics.', NOW() + INTERVAL '5 days', 'Neon Moves Studio, NY', 0.03, 15.00, 40, '/placeholder.svg?height=400&width=600'),
  ('11111111-1111-1111-1111-111111111111', 'Contemporary Flow', 'Express yourself through movement.', NOW() + INTERVAL '1 week', 'Rhythm & Flow, LA', 0.04, 20.00, 25, '/placeholder.svg?height=400&width=600');
