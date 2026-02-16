import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Exercise name mappings — our app names to ExerciseDB search terms
const EXERCISE_NAME_MAPPINGS: Record<string, string> = {
  'incline db press': 'dumbbell incline bench press',
  'overhead db extension': 'dumbbell seated triceps extension',
  'overhead rope extension': 'cable overhead triceps extension',
  'weighted dips': 'weighted tricep dips',
  'cable fly': 'cable crossover',
  'rope pulldown crunches': 'cable crunch',
  'hanging leg raises': 'hanging leg raise',
  'band pull-aparts': 'band pull apart',
  'band shoulder dislocates': 'band shoulder press',
  'pull-ups': 'pull up',
  't-bar row': 'lever t bar row',
  'close grip lat pulldown': 'cable close grip lat pulldown',
  'single-arm cable row': 'cable one arm seated row',
  'face pulls': 'cable face pull',
  'ez bar curl': 'ez barbell curl',
  'hammer curls': 'dumbbell hammer curl',
  'dead hangs': 'dead hang',
  'scapular pull-ups': 'scapular pull-up',
  'band rows': 'resistance band seated row',
  'reverse crunches': 'reverse crunch',
  'ab wheel rollouts': 'wheel rollout',
  'ab wheel rollout': 'wheel rollout',
  'hip thrusts': 'barbell hip thrust',
  'goblet squat': 'dumbbell goblet squat',
  'leg press': 'sled leg press',
  'leg extension': 'lever leg extension',
  'lying leg curl': 'lever lying leg curl',
  'hip abductor machine': 'lever seated hip abduction',
  'walking lunges': 'dumbbell walking lunge',
  'seated calf raises': 'lever seated calf raise',
  'air squats': 'bodyweight squat',
  'banded lateral walks': 'resistance band lateral walk',
  'banded lateral walk': 'resistance band lateral walk',
  'deep squat hold': 'bodyweight squat',
  'zombie walks': 'bodyweight walking lunge',
  'incline treadmill walk': 'walking on incline treadmill',
  'push-ups': 'push up',
  'rowing machine': 'rowing machine',
  'bike or stair stepper': 'stationary bike',
  'bike': 'stationary bike',
  'plank': 'plank',
  'arm circles': 'arm circles',
  'bent over barbell row': 'barbell bent over row',
  'overhead press': 'barbell overhead press',
  'lat pulldown': 'cable lat pulldown',
  'lateral raises': 'dumbbell lateral raise',
  'tricep pushdown': 'cable pushdown',
  'bodyweight squats': 'bodyweight squat',
  'hip circles': 'hip circles',
  'hip thrust': 'barbell hip thrust',
  'rdl': 'barbell romanian deadlift',
  'leg abduction': 'lever seated hip abduction',
  'bulgarian split squats': 'dumbbell bulgarian split squat',
  'leg cable kickback': 'cable kickback',
  'leg curl': 'lever lying leg curl',
  'single-arm dumbbell row': 'dumbbell one arm row',
  'single leg rdl': 'dumbbell single leg deadlift',
  'barbell back squat': 'barbell squat',
  'barbell row': 'barbell bent over row',
  'cable row': 'cable seated row',
  'pec deck machine': 'pec deck fly',
  'decline dumbbell press': 'dumbbell decline bench press',
  'straight arm pulldown': 'cable straight arm pulldown',
  'seated dumbbell shoulder press': 'dumbbell seated shoulder press',
  'rear delt fly machine': 'lever rear delt fly',
  'incline dumbbell curl': 'dumbbell incline curl',
  'close grip bench press': 'close grip barbell bench press',
  'band curl': 'resistance band bicep curl',
  'dumbbell front raise': 'dumbbell front raise',
  'cable lateral raise': 'cable lateral raise',
  'romanian deadlift': 'barbell romanian deadlift',
  'glute-focused hyperextension': 'hyperextension',
  'seated leg curl': 'lever seated leg curl',
  'single-leg hip thrust': 'single leg hip thrust',
  'cable pull-through': 'cable pull through',
  'incline dumbbell press': 'dumbbell incline bench press',
  'banded glute bridge': 'resistance band glute bridge',
  'banded monster walk': 'resistance band monster walk',
  'jump rope or jumping jacks': 'jumping jack',
  'scapula push-ups': 'scapular push up',
  'bicep curl': 'dumbbell bicep curl',
  'overhead tricep extension': 'dumbbell overhead tricep extension',
  'rear delt fly': 'dumbbell rear delt fly',
  'banded clamshell': 'resistance band hip abduction',
  'banded fire hydrant': 'resistance band fire hydrant',
  'glute bridge hold': 'glute bridge',
  'cable glute kickback': 'cable kickback',
  'abductor machine': 'lever seated hip abduction',
  'step-ups': 'dumbbell step up',
  'step-up': 'dumbbell step up',
  'smith machine hip thrust': 'smith machine hip thrust',
  'walking quad stretch': 'quad stretch',
  'band dislocate': 'band pull apart',
  'shoulder cars': 'shoulder circles',
  'ankle cars': 'ankle circles',
  'wrist cars': 'wrist circles',
  'hip cars': 'hip circles',
  'elbow cars': 'elbow circles',
  'dead bug': 'dead bug',
  'pallof press hold': 'pallof press',
  'pallof press': 'pallof press',
  'hanging knee raise': 'hanging knee raise',
  'side plank': 'side plank',
  'hollow body hold': 'hollow body',
  'plank with shoulder tap': 'plank',
  'turkish get-up': 'turkish get up',
  'bear crawl hold': 'bear crawl',
  'banded dead bug': 'dead bug',
  'copenhagen plank': 'copenhagen side bridge',
  'cossack squat': 'cossack squat',
  '90/90 hip switches': '90 90 hip switch',
  '90/90 hip switch': '90 90 hip switch',
  'walking knee hug': 'knee hug',
  'lateral lunge hold': 'lateral lunge',
  'shin box transition': 'shin box',
  'half kneeling hip flexor stretch': 'hip flexor stretch',
  'cat-cow': 'cat cow stretch',
  'thoracic rotation': 'thoracic spine rotation',
  'side-lying windmill': 'windmill',
  'prone press-up': 'cobra stretch',
  "child's pose with lateral reach": "child's pose",
  'supine spinal twist': 'supine twist',
  'wall slides': 'wall slide',
  'prone y-t-w raise': 'prone y raise',
  'side-lying external rotation': 'side lying external rotation',
  'supine figure-4 stretch': 'figure 4 stretch',
  'prone quad stretch': 'lying quad stretch',
  'neck half circle': 'neck circles',
};

function normalizeSearchName(name: string): string {
  let normalized = name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/db\b/gi, 'dumbbell')
    .replace(/bb\b/gi, 'barbell')
    .replace(/\s+/g, ' ')
    .trim();

  if (EXERCISE_NAME_MAPPINGS[normalized]) {
    return EXERCISE_NAME_MAPPINGS[normalized];
  }

  normalized = normalized.replace(/(?<=[a-z]{2}[^s])s$/, '');

  if (EXERCISE_NAME_MAPPINGS[normalized]) {
    return EXERCISE_NAME_MAPPINGS[normalized];
  }

  return normalized;
}

function getMainKeyword(name: string): string | null {
  const keywords = [
    'press', 'curl', 'row', 'squat', 'lunge', 'deadlift', 'fly', 'raise',
    'extension', 'pulldown', 'pull-up', 'pull up', 'dip', 'crunch', 'plank',
    'thrust', 'walk', 'step', 'bike', 'rowing',
    'rotation', 'stretch', 'hang', 'slide', 'circle', 'bug', 'kickback',
    'bridge', 'kick', 'climber', 'twist', 'hyperextension', 'shrug',
    'calf', 'hip', 'glute', 'ab', 'pullover',
  ];
  const nameLower = name.toLowerCase();
  for (const keyword of keywords) {
    if (nameLower.includes(keyword)) return keyword;
  }
  return null;
}

interface V1Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

function findBestMatch(exercises: V1Exercise[], searchName: string): V1Exercise | null {
  if (exercises.length === 0) return null;
  const searchLower = searchName.toLowerCase();
  const searchWords = searchLower.split(' ').filter((w: string) => w.length > 2);

  let bestMatch: V1Exercise | null = null;
  let bestScore = 0;

  for (const exercise of exercises) {
    const nameLower = exercise.name.toLowerCase();
    let score = 0;
    if (nameLower === searchLower) return exercise;
    if (nameLower.startsWith(searchLower)) score += 50;
    const matchingWords = searchWords.filter((word: string) => nameLower.includes(word));
    score += matchingWords.length * 10;
    const nameWords = nameLower.split(' ').length;
    if (Math.abs(nameWords - searchWords.length) <= 1) score += 5;
    if (nameLower.includes(searchLower)) score += 20;
    const lengthDiff = Math.abs(nameLower.length - searchLower.length);
    score -= Math.min(lengthDiff / 5, 10);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = exercise;
    }
  }
  return bestScore > 5 ? bestMatch : exercises[0];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request
    const { exerciseName } = await req.json();
    if (!exerciseName || typeof exerciseName !== 'string' || exerciseName.trim().length === 0) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'exerciseName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedName = exerciseName.trim();
    console.log(`[fetch-exercise] Looking up: "${trimmedName}"`);

    // Create Supabase admin client (service role for writes)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Check exercise_name_mapping
    const { data: mapping } = await supabase
      .from('exercise_name_mapping')
      .select('*, exercise_cache(*)')
      .eq('app_name', trimmedName.toLowerCase())
      .maybeSingle();

    if (mapping) {
      if (mapping.exercise_cache_id && mapping.exercise_cache) {
        // Cached hit — update last_accessed_at
        console.log(`[fetch-exercise] Cache HIT for "${trimmedName}"`);
        await supabase
          .from('exercise_cache')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('id', mapping.exercise_cache_id);

        return new Response(
          JSON.stringify({ status: 'cached', data: mapping.exercise_cache }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Previously looked up but not found
        console.log(`[fetch-exercise] Known NOT FOUND for "${trimmedName}"`);
        return new Response(
          JSON.stringify({ status: 'not_found', exerciseName: trimmedName }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Step 2: Check rate limits
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsage } = await supabase
      .from('exercisedb_api_usage')
      .select('calls_made')
      .eq('date', today)
      .maybeSingle();

    const dailyCalls = todayUsage?.calls_made ?? 0;

    const { data: monthlyData } = await supabase
      .rpc('get_exercisedb_usage_stats');

    const monthlyCalls = monthlyData?.monthly_calls ?? 0;

    if (dailyCalls >= 450) {
      console.log(`[fetch-exercise] Daily limit reached (${dailyCalls}/500)`);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return new Response(
        JSON.stringify({ status: 'daily_limit', resetsAt: tomorrow.toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (monthlyCalls >= 1800) {
      console.log(`[fetch-exercise] Monthly limit reached (${monthlyCalls}/2000)`);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      nextMonth.setHours(0, 0, 0, 0);
      return new Response(
        JSON.stringify({ status: 'monthly_limit', resetsAt: nextMonth.toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Call ExerciseDB API (V1 OSS — no API key needed)
    const V1_BASE = 'https://oss.exercisedb.dev/api/v1';
    const normalizedName = normalizeSearchName(trimmedName);
    console.log(`[fetch-exercise] Searching ExerciseDB for: "${normalizedName}"`);

    let exercise: V1Exercise | null = null;
    let apiCallsUsed = 0;

    // Try exact name search first
    try {
      const resp = await fetch(`${V1_BASE}/exercises?search=${encodeURIComponent(normalizedName)}&limit=10`);
      apiCallsUsed++;
      if (resp.ok) {
        const json = await resp.json();
        const exercises: V1Exercise[] = json.data || [];
        exercise = findBestMatch(exercises, normalizedName);
      }
    } catch (e) {
      console.error(`[fetch-exercise] V1 search failed:`, e);
    }

    // Fallback: try keyword + equipment
    if (!exercise) {
      const keyword = getMainKeyword(trimmedName);
      if (keyword) {
        const hasBarbell = /barbell|bb\b/i.test(trimmedName);
        const hasDumbbell = /dumbbell|db\b/i.test(trimmedName);
        const hasCable = /cable|rope/i.test(trimmedName);
        const hasLever = /machine|lever/i.test(trimmedName);
        let fallback = keyword;
        if (hasBarbell) fallback = `barbell ${keyword}`;
        else if (hasDumbbell) fallback = `dumbbell ${keyword}`;
        else if (hasCable) fallback = `cable ${keyword}`;
        else if (hasLever) fallback = `lever ${keyword}`;

        try {
          const resp = await fetch(`${V1_BASE}/exercises?search=${encodeURIComponent(fallback)}&limit=10`);
          apiCallsUsed++;
          if (resp.ok) {
            const json = await resp.json();
            const exercises: V1Exercise[] = json.data || [];
            exercise = findBestMatch(exercises, trimmedName.toLowerCase());
          }
        } catch (e) {
          console.error(`[fetch-exercise] Fallback search failed:`, e);
        }
      }
    }

    // Step 4: Update API usage tracking
    await supabase
      .from('exercisedb_api_usage')
      .upsert(
        {
          date: today,
          calls_made: dailyCalls + apiCallsUsed,
          exercise_names_fetched: [...(todayUsage ? [] : []), trimmedName],
        },
        { onConflict: 'date' }
      );

    // Also append the name to the fetched list if row already existed
    if (todayUsage) {
      await supabase.rpc('', {}).catch(() => {});
      // Simple: just update calls_made (name tracking is best-effort)
      await supabase
        .from('exercisedb_api_usage')
        .update({ calls_made: dailyCalls + apiCallsUsed })
        .eq('date', today);
    }

    if (exercise) {
      // Step 5a: Cache the exercise
      console.log(`[fetch-exercise] FOUND: "${exercise.name}" for "${trimmedName}"`);

      const cacheData = {
        exercisedb_id: exercise.exerciseId,
        exercisedb_name: exercise.name,
        app_exercise_names: [trimmedName.toLowerCase()],
        body_part: exercise.bodyParts?.[0] || null,
        equipment: exercise.equipments?.[0] || null,
        target_muscle: exercise.targetMuscles?.[0] || null,
        secondary_muscles: exercise.secondaryMuscles || [],
        instructions: exercise.instructions || [],
        gif_url: exercise.gifUrl || null,
        fetched_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };

      // Upsert into exercise_cache (might already exist from different app name)
      const { data: cached, error: cacheError } = await supabase
        .from('exercise_cache')
        .upsert(cacheData, { onConflict: 'exercisedb_id' })
        .select()
        .single();

      if (cacheError) {
        console.error(`[fetch-exercise] Cache insert error:`, cacheError);
      }

      const cacheId = cached?.id;

      // If this exercise already existed, append our app name
      if (cached && !cached.app_exercise_names?.includes(trimmedName.toLowerCase())) {
        await supabase
          .from('exercise_cache')
          .update({
            app_exercise_names: [...(cached.app_exercise_names || []), trimmedName.toLowerCase()],
          })
          .eq('id', cacheId);
      }

      // Insert name mapping
      await supabase
        .from('exercise_name_mapping')
        .upsert(
          {
            app_name: trimmedName.toLowerCase(),
            exercisedb_name: exercise.name,
            exercise_cache_id: cacheId,
            match_confidence: exercise.name.toLowerCase() === normalizedName ? 'exact' : 'fuzzy',
          },
          { onConflict: 'app_name' }
        );

      return new Response(
        JSON.stringify({ status: 'fetched', data: cached || cacheData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Step 5b: No match found — record it so we don't waste calls next time
      console.log(`[fetch-exercise] NOT FOUND for "${trimmedName}"`);

      await supabase
        .from('exercise_name_mapping')
        .upsert(
          {
            app_name: trimmedName.toLowerCase(),
            exercisedb_name: null,
            exercise_cache_id: null,
            match_confidence: 'auto',
          },
          { onConflict: 'app_name' }
        );

      return new Response(
        JSON.stringify({ status: 'not_found', exerciseName: trimmedName }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // API errors — do NOT insert into name_mapping so it retries next time
    console.error(`[fetch-exercise] Error:`, error);
    return new Response(
      JSON.stringify({ status: 'api_error', message: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
