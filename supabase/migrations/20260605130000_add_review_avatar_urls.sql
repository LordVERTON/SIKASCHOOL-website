-- Backfill testimonial avatars for existing reviews.
UPDATE reviews
SET avatar_url = CASE
  WHEN student_name = 'Camille R.' THEN
    'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  WHEN student_name = 'Thomas L.' THEN
    'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  WHEN student_name ILIKE 'Marie%' THEN
    'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  WHEN student_name ILIKE 'Jean%' THEN
    'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  WHEN student_name ILIKE 'Sophie%' THEN
    'https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ELSE
    'https://images.pexels.com/photos/19797873/pexels-photo-19797873.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
END
WHERE avatar_url IS NULL OR avatar_url = '';
