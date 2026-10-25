-- Keep existing location slugs so current reports and filters remain valid.
update public.locations
set name = case slug
  when 'covered-court' then 'Basketball Court'
  when 'admin-building' then 'AquaBest'
end
where slug in ('covered-court', 'admin-building');
